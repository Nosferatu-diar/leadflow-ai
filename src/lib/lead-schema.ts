import { z } from 'zod'
import messages from '../../messages/en.json'

type ValidationKey = keyof typeof messages.Validation
type TranslateValidation = (key: ValidationKey) => string

export const contactMethods = ['Telegram', 'Email', 'Phone'] as const
export const services = [
	'Website',
	'Web Application',
	'AI Automation',
	'Other',
] as const

export function createLeadSchema(t: TranslateValidation) {
	return z.object({
		name: z
			.string({ error: t('nameRequired') })
			.trim()
			.min(2, t('nameMin')),
		contactMethod: z.enum(contactMethods, {
			error: t('contactMethod'),
		}),
		contact: z
			.string({ error: t('contactRequired') })
			.trim()
			.min(1, t('contactRequired')),
		service: z.enum(services, { error: t('service') }),
		budget: z.string({ error: t('budget') }).trim().optional(),
		message: z
			.string({ error: t('message') })
			.max(1000, t('messageMax'))
			.trim()
			.optional(),
	})
		.superRefine((lead, context) => {
			let valid: boolean
			let message: string
			switch (lead.contactMethod) {
				case 'Email':
					valid = z.email().safeParse(lead.contact).success
					message = t('email')
					break
				case 'Phone': {
					const digits = lead.contact.replace(/\D/g, '')
					valid = /^\+?[0-9 ()-]+$/.test(lead.contact) && digits.length >= 7 && digits.length <= 15
					message = t('phone')
					break
				}
				case 'Telegram':
					valid = /^(?:@[a-z][a-z0-9_]{4,31}|https:\/\/t\.me\/[a-z][a-z0-9_]{4,31}\/?)$/i.test(lead.contact)
					message = t('telegram')
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

}

// English fallback for non-localized callers; rules exist in just one factory.
export const leadSchema = createLeadSchema(key => messages.Validation[key])

export type Lead = z.infer<typeof leadSchema>
export type LeadFieldErrors = Partial<Record<keyof Lead, string[]>>

export type LeadApiResponse =
	| { success: true; message: string; leadId: string }
	| { success: false; message: string; fieldErrors?: LeadFieldErrors }
