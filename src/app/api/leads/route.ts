import { leadSchema, type Lead } from '@/lib/lead-schema'
import { prisma } from '@/lib/prisma'
import { Service } from '@prisma/client'
import { z } from 'zod'

export const runtime = 'nodejs'

// Form labels remain readable; Prisma uses identifiers without spaces.
const serviceValues = {
	Website: Service.Website,
	'Web Application': Service.WebApplication,
	'AI Automation': Service.AIAutomation,
	Other: Service.Other,
} satisfies Record<Lead['service'], Service>

export async function POST(request: Request) {
	let body: unknown

	try {
		body = await request.json()
	} catch {
		return Response.json(
			{ success: false, message: 'Send a valid JSON request.' },
			{ status: 400 },
		)
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

	try {
		const lead = await prisma.lead.create({
			data: {
				name: result.data.name,
				contactMethod: result.data.contactMethod,
				contact: result.data.contact,
				service: serviceValues[result.data.service],
				budget: result.data.budget || null,
				message: result.data.message || null,
			},
			select: { id: true },
		})

		return Response.json(
			{
				success: true,
				message: 'Lead received successfully',
				leadId: lead.id,
			},
			{ status: 201 },
		)
	} catch {
		// Do not expose credentials, query details, or submitted contact information.
		console.error('Unable to save lead to PostgreSQL.')
		return Response.json(
			{ success: false, message: 'We could not save your request. Please try again later.' },
			{ status: 503 },
		)
	}
}
