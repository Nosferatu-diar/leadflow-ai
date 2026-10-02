'use client'

import { useRef, useState, type FormEvent } from 'react'
import { z } from 'zod'
import {
	contactMethods,
	leadSchema,
	services,
	type LeadApiResponse,
	type LeadFieldErrors,
} from '@/lib/lead-schema'

const fieldClassName = 'mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 aria-invalid:border-red-400'
const labelClassName = 'block text-sm font-medium text-zinc-200'

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
	return messages?.length ? <p id={id} className='mt-2 text-sm text-red-300'>{messages[0]}</p> : null
}

export function LeadForm() {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [fieldErrors, setFieldErrors] = useState<LeadFieldErrors>({})
	const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null)
	// A synchronous guard also blocks submissions before React updates the button.
	const submissionInProgress = useRef(false)
	const feedbackRef = useRef<HTMLDivElement>(null)

	function showError(message: string, errors: LeadFieldErrors = {}) {
		setFieldErrors(errors)
		setFeedback({ kind: 'error', message })
		feedbackRef.current?.focus()
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (submissionInProgress.current) return

		const form = event.currentTarget
		const result = leadSchema.safeParse(Object.fromEntries(new FormData(form)))
		setFeedback(null)
		setFieldErrors({})

		if (!result.success) {
			showError('Please check the highlighted fields.', z.flattenError(result.error).fieldErrors)
			return
		}

		submissionInProgress.current = true
		setIsSubmitting(true)

		try {
			const response = await fetch('/api/leads', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(result.data),
			})
			const data: LeadApiResponse = await response.json()

			if (!response.ok || data.success !== true) {
				showError(
					typeof data.message === 'string' ? data.message : 'Unable to send your request. Please try again.',
					data.success === false ? data.fieldErrors : undefined,
				)
				return
			}

			form.reset()
			setFeedback({ kind: 'success', message: data.message })
		} catch {
			showError('Unable to send your request. Check your connection and try again.')
		} finally {
			submissionInProgress.current = false
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} aria-busy={isSubmitting} className='mt-8 max-w-3xl'>
			<p className='mb-6 text-sm text-zinc-400'>Fields marked with * are required.</p>
			<fieldset disabled={isSubmitting} className='grid min-w-0 gap-6 sm:grid-cols-2'>
				<legend className='sr-only'>Your lead request</legend>
				<div>
					<label htmlFor='lead-name' className={labelClassName}>Name *</label>
					<input id='lead-name' name='name' autoComplete='name' required minLength={2} className={fieldClassName} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? 'lead-name-error' : undefined} />
					<FieldError id='lead-name-error' messages={fieldErrors.name} />
				</div>
				<div>
					<label htmlFor='lead-contact-method' className={labelClassName}>Contact method *</label>
					<select id='lead-contact-method' name='contactMethod' defaultValue='' required className={fieldClassName} aria-invalid={Boolean(fieldErrors.contactMethod)} aria-describedby={fieldErrors.contactMethod ? 'lead-contact-method-error' : undefined}>
						<option value='' disabled>Choose a contact method</option>
						{contactMethods.map(method => <option key={method} value={method}>{method}</option>)}
					</select>
					<FieldError id='lead-contact-method-error' messages={fieldErrors.contactMethod} />
				</div>
				<div>
					<label htmlFor='lead-contact' className={labelClassName}>Contact *</label>
					<input id='lead-contact' name='contact' required className={fieldClassName} aria-invalid={Boolean(fieldErrors.contact)} aria-describedby={`lead-contact-hint${fieldErrors.contact ? ' lead-contact-error' : ''}`} />
					<p id='lead-contact-hint' className='mt-2 text-xs text-zinc-400'>Your Telegram username, email address, or phone number.</p>
					<FieldError id='lead-contact-error' messages={fieldErrors.contact} />
				</div>
				<div>
					<label htmlFor='lead-service' className={labelClassName}>Service *</label>
					<select id='lead-service' name='service' defaultValue='' required className={fieldClassName} aria-invalid={Boolean(fieldErrors.service)} aria-describedby={fieldErrors.service ? 'lead-service-error' : undefined}>
						<option value='' disabled>Choose a service</option>
						{services.map(service => <option key={service} value={service}>{service}</option>)}
					</select>
					<FieldError id='lead-service-error' messages={fieldErrors.service} />
				</div>
				<div className='sm:col-span-2'>
					<label htmlFor='lead-budget' className={labelClassName}>Budget <span className='font-normal text-zinc-400'>(optional)</span></label>
					<input id='lead-budget' name='budget' placeholder='For example: $1,000–$3,000' className={fieldClassName} aria-invalid={Boolean(fieldErrors.budget)} aria-describedby={fieldErrors.budget ? 'lead-budget-error' : undefined} />
					<FieldError id='lead-budget-error' messages={fieldErrors.budget} />
				</div>
				<div className='sm:col-span-2'>
					<label htmlFor='lead-message' className={labelClassName}>Message <span className='font-normal text-zinc-400'>(optional)</span></label>
					<textarea id='lead-message' name='message' rows={5} maxLength={1000} className={`${fieldClassName} resize-y`} aria-invalid={Boolean(fieldErrors.message)} aria-describedby={`lead-message-hint${fieldErrors.message ? ' lead-message-error' : ''}`} />
					<p id='lead-message-hint' className='mt-2 text-xs text-zinc-400'>Tell us about your project. Maximum 1000 characters.</p>
					<FieldError id='lead-message-error' messages={fieldErrors.message} />
				</div>
			</fieldset>
			<div ref={feedbackRef} tabIndex={-1} aria-live='polite' aria-atomic='true' className='mt-6 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300'>
				{feedback && <p className={`text-sm ${feedback.kind === 'success' ? 'text-teal-300' : 'text-red-300'}`}>{feedback.message}</p>}
			</div>
			<button type='submit' disabled={isSubmitting} className='mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-teal-300 px-6 text-sm font-semibold text-zinc-950 hover:bg-teal-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300 disabled:cursor-wait disabled:opacity-60 sm:w-auto'>
				{isSubmitting ? 'Sending…' : 'Send Request'}
			</button>
		</form>
	)
}
