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

export type Lead = z.infer<typeof leadSchema>
export type LeadFieldErrors = Partial<Record<keyof Lead, string[]>>

export type LeadApiResponse =
	| { success: true; message: string; leadId: string }
	| { success: false; message: string; fieldErrors?: LeadFieldErrors }
