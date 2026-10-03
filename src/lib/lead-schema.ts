import { z } from 'zod'

export const contactMethods = ['Telegram', 'Email', 'Phone'] as const
export const services = [
	'Website',
	'Web Application',
	'AI Automation',
	'Other',
] as const

export const leadSchema = z.object({
	name: z
		.string({ error: 'Please enter your name.' })
		.trim()
		.min(2, 'Name must contain at least 2 characters.'),
	contactMethod: z.enum(contactMethods, {
		error: 'Choose Telegram, Email, or Phone.',
	}),
	contact: z
		.string({ error: 'Please enter your contact details.' })
		.trim()
		.min(1, 'Please enter your contact details.'),
	service: z.enum(services, { error: 'Choose one of the available services.' }),
	budget: z.string({ error: 'Budget must be text.' }).trim().optional(),
	message: z
		.string({ error: 'Message must be text.' })
		.max(1000, 'Message must be 1000 characters or fewer.')
		.trim()
		.optional(),
})
	.superRefine((lead, context) => {
		let valid: boolean
		let message: string
		switch (lead.contactMethod) {
			case 'Email':
				valid = z.email().safeParse(lead.contact).success
				message = 'Enter a valid email address.'
				break
			case 'Phone': {
				const digits = lead.contact.replace(/\D/g, '')
				valid = /^\+?[0-9 ()-]+$/.test(lead.contact) && digits.length >= 7 && digits.length <= 15
				message = 'Enter a valid phone number.'
				break
			}
			case 'Telegram':
				valid = /^(?:@[a-z][a-z0-9_]{4,31}|https:\/\/t\.me\/[a-z][a-z0-9_]{4,31}\/?)$/i.test(lead.contact)
				message = 'Enter a valid Telegram username.'
				break
		}
		if (!valid) context.addIssue({ code: 'custom', path: ['contact'], message })
	})
	.transform(lead => ({
		...lead,
		contact: lead.contactMethod === 'Telegram'
			? `@${lead.contact.replace(/^(?:@|https:\/\/t\.me\/)/i, '').replace(/\/$/, '')}`
			: lead.contact,
	}))

export type Lead = z.infer<typeof leadSchema>
export type LeadFieldErrors = Partial<Record<keyof Lead, string[]>>

export type LeadApiResponse =
	| { success: true; message: string; leadId: string }
	| { success: false; message: string; fieldErrors?: LeadFieldErrors }
