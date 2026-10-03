import { leadSchema, type Lead } from '@/lib/lead-schema'
import { prisma } from '@/lib/prisma'
import { sendLeadNotification } from '@/lib/telegram/send-lead-notification'
import { Service } from '@prisma/client'
import { z } from 'zod'
import { readLimitedJson, RequestTooLargeError } from '@/lib/security/read-json'
import { clientBucket, consumeRateLimit } from '@/lib/security/rate-limit'
import { hasAllowedOrigin } from '@/lib/security/request-origin'
import { hasValidSubmissionSignals } from '@/lib/security/lead-submission'

export const runtime = 'nodejs'

// Form labels remain readable; Prisma uses identifiers without spaces.
const serviceValues = {
	Website: Service.Website,
	'Web Application': Service.WebApplication,
	'AI Automation': Service.AIAutomation,
	Other: Service.Other,
} satisfies Record<Lead['service'], Service>

export async function POST(request: Request) {
	if (!hasAllowedOrigin(request)) {
		return Response.json({ success: false, message: 'Request not allowed.' }, { status: 403 })
	}
	const client = clientBucket(request)
	const rate = consumeRateLimit(`leads:${client.key}`, client.identified ? 5 : 30, 10 * 60_000)
	if (!rate.allowed) {
		return Response.json({ success: false, message: 'Too many requests. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } })
	}
	let body: unknown

	try {
		body = await readLimitedJson(request, 16 * 1024)
	} catch (error) {
		if (error instanceof RequestTooLargeError) {
			return Response.json({ success: false, message: 'Request is too large.' }, { status: 413 })
		}
		return Response.json(
			{ success: false, message: 'Send a valid JSON request.' },
			{ status: 400 },
		)
	}
	if (!hasValidSubmissionSignals(body)) {
		return Response.json({ success: false, message: 'Unable to accept this request. Please try again.' }, { status: 400 })
	}

	const result = leadSchema.safeParse(body)

	if (!result.success) {
		return Response.json(
			{
				success: false,
				message: 'Please check your details and try again.',
				fieldErrors: z.flattenError(result.error).fieldErrors,
			},
			{ status: 400 },
		)
	}

	let lead
	try {
		lead = await prisma.lead.create({
			data: {
				name: result.data.name,
				contactMethod: result.data.contactMethod,
				contact: result.data.contact,
				service: serviceValues[result.data.service],
				budget: result.data.budget || null,
				message: result.data.message || null,
			},
			select: { id: true, name: true, contactMethod: true, contact: true, service: true, budget: true, message: true },
		})
	} catch {
		// Do not expose credentials, query details, or submitted contact information.
		console.error('Unable to save lead to PostgreSQL.')
		return Response.json(
			{ success: false, message: 'We could not save your request. Please try again later.' },
			{ status: 503 },
		)
	}

	// The insert is committed. Notification failure must never fail the submission.
	try {
		const notification = await sendLeadNotification({
			name: lead.name,
			contactMethod: lead.contactMethod,
			contact: lead.contact,
			service: lead.service,
			budget: lead.budget,
			message: lead.message,
		})
		if (notification.status === 'not-configured') {
			console.warn('Telegram notification skipped: configure TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID on the server.')
		} else if (notification.status === 'failed') {
			console.error('Telegram notification failed; the lead was saved successfully.')
		}
	} catch {
		// Keep even an unexpected notification-helper error separate from persistence.
		console.error('Telegram notification failed; the lead was saved successfully.')
	}

	return Response.json(
		{ success: true, message: 'Lead received successfully', leadId: lead.id },
		{ status: 201 },
	)
}
