import 'server-only'
import type { Lead } from '@prisma/client'

type NotificationLead = Pick<Lead, 'name' | 'contactMethod' | 'contact' | 'service' | 'budget' | 'message'>
type NotificationResult = { status: 'sent' | 'not-configured' | 'failed' }

const serviceLabels: Record<NotificationLead['service'], string> = {
	Website: 'Website',
	WebApplication: 'Web Application',
	AIAutomation: 'AI Automation',
	Other: 'Other',
}

function shortField(value: string, limit: number) {
	const text = value.trim().replace(/[\r\n]+/g, ' ')
	return text.length > limit ? `${text.slice(0, limit)}…` : text
}

export async function sendLeadNotification(lead: NotificationLead): Promise<NotificationResult> {
	const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
	const chatId = process.env.TELEGRAM_CHAT_ID?.trim()
	if (!token || !chatId) return { status: 'not-configured' }

	try {
		// Bound unbounded form fields so the message stays below Telegram's limit.
		const text = [
			'New Lead — LeadFlow AI',
			'',
			`Name: ${shortField(lead.name, 200)}`,
			`Contact Method: ${lead.contactMethod}`,
			`Contact: ${shortField(lead.contact, 300)}`,
			`Service: ${serviceLabels[lead.service]}`,
			`Budget: ${lead.budget?.trim() ? shortField(lead.budget, 200) : 'Not provided'}`,
			'',
			'Message:',
			lead.message?.trim().slice(0, 1000) || 'Not provided',
		].join('\n')

		const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ chat_id: chatId, text, link_preview_options: { is_disabled: true } }),
			cache: 'no-store',
			redirect: 'error',
			signal: AbortSignal.timeout(5000),
		})
		if (!response.ok) return { status: 'failed' }

		const result: unknown = await response.json()
		if (typeof result !== 'object' || result === null || !('ok' in result) || result.ok !== true) {
			return { status: 'failed' }
		}
		return { status: 'sent' }
	} catch {
		// Raw fetch errors can contain the bot token in the URL. Never return them.
		return { status: 'failed' }
	}
}
