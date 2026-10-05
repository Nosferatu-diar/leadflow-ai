'use client'

import {
	contactMethods,
	createLeadSchema,
	services,
	type LeadApiResponse,
	type LeadFieldErrors,
} from '@/lib/lead-schema'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { z } from 'zod'
import { useLocale, useTranslations } from 'next-intl'

const fieldClassName =
	'mt-2 min-h-12 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-400 transition-colors hover:border-zinc-600 focus-visible:border-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 aria-invalid:border-red-400 disabled:opacity-60 sm:text-sm'
const labelClassName = 'block text-sm font-medium text-zinc-200'

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
	return messages?.length ? (
		<p id={id} className='mt-2 text-sm text-red-300'>
			{messages[0]}
		</p>
	) : null
}

export function LeadForm() {
	const locale = useLocale()
	const t = useTranslations('Form')
	const fields = useTranslations('Fields')
	const common = useTranslations('Common')
	const methods = useTranslations('ContactMethods')
	const serviceLabels = useTranslations('Services')
	const validation = useTranslations('Validation')
	const [contactMethod, setContactMethod] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [fieldErrors, setFieldErrors] = useState<LeadFieldErrors>({})
	const [feedback, setFeedback] = useState<{
		kind: 'success' | 'error'
		message: string
	} | null>(null)
	// A synchronous guard also blocks submissions before React updates the button.
	const submissionInProgress = useRef(false)
	const feedbackRef = useRef<HTMLDivElement>(null)
	const initializedAt = useRef<number | null>(null)
	useEffect(() => { initializedAt.current = performance.now() }, [])
	useEffect(() => {
		if (feedback) feedbackRef.current?.focus()
	}, [feedback])

	function showError(message: string, errors: LeadFieldErrors = {}) {
		setFieldErrors(errors)
		setFeedback({ kind: 'error', message })
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (submissionInProgress.current) return

		const form = event.currentTarget
		const result = createLeadSchema(validation).safeParse(Object.fromEntries(new FormData(form)))
		setFeedback(null)
		setFieldErrors({})

		if (!result.success) {
			showError(
				t('checkFields'),
				z.flattenError(result.error).fieldErrors,
			)
			return
		}

		submissionInProgress.current = true
		setIsSubmitting(true)

		try {
			const response = await fetch('/api/leads', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'x-leadflow-locale': locale },
				body: JSON.stringify({
					...result.data,
					website: new FormData(form).get('website'),
					formFillTimeMs: initializedAt.current === null ? 0 : Math.floor(performance.now() - initializedAt.current),
				}),
			})
			const data: LeadApiResponse = await response.json()

			if (!response.ok || data.success !== true) {
				showError(
					typeof data.message === 'string'
						? data.message
						: t('sendFailed'),
					data.success === false ? data.fieldErrors : undefined,
				)
				return
			}

			form.reset()
			initializedAt.current = performance.now()
			setContactMethod('')
			setFeedback({ kind: 'success', message: data.message })
		} catch {
			showError(
				t('connection'),
			)
		} finally {
			submissionInProgress.current = false
			setIsSubmitting(false)
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			aria-busy={isSubmitting}
			className='w-full min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-8'
		>
			<div aria-hidden='true' className='absolute -left-[10000px] h-px w-px overflow-hidden'>
				<label htmlFor='lead-website'>{t('honeypot')}</label>
				<input id='lead-website' name='website' type='text' tabIndex={-1} autoComplete='off' />
			</div>
			<p className='mb-6 text-sm text-zinc-400'>
				{t('requiredHint')}
			</p>
			<fieldset
				disabled={isSubmitting}
				className='grid min-w-0 gap-6 sm:grid-cols-2'
			>
				<legend className='sr-only'>{t('legend')}</legend>
				<div>
					<label htmlFor='lead-name' className={labelClassName}>
						{fields('name')} *
					</label>
					<input
						id='lead-name'
						name='name'
						autoComplete='name'
						required
						minLength={2}
						className={fieldClassName}
						aria-invalid={Boolean(fieldErrors.name)}
						aria-describedby={fieldErrors.name ? 'lead-name-error' : undefined}
					/>
					<FieldError id='lead-name-error' messages={fieldErrors.name} />
				</div>
				<div>
					<label htmlFor='lead-contact-method' className={labelClassName}>
						{fields('contactMethod')} *
					</label>
					<select
						id='lead-contact-method'
						name='contactMethod'
						value={contactMethod}
						onChange={event => {
							setContactMethod(event.target.value)
							setFieldErrors(current => ({ ...current, contact: undefined, contactMethod: undefined }))
						}}
						required
						className={fieldClassName}
						aria-invalid={Boolean(fieldErrors.contactMethod)}
						aria-describedby={
							fieldErrors.contactMethod
								? 'lead-contact-method-error'
								: undefined
						}
					>
						<option value='' disabled>
							{t('chooseContact')}
						</option>
						{contactMethods.map(method => (
							<option key={method} value={method}>
								{methods(method)}
							</option>
						))}
					</select>
					<FieldError
						id='lead-contact-method-error'
						messages={fieldErrors.contactMethod}
					/>
				</div>
				<div>
					<label htmlFor='lead-contact' className={labelClassName}>
						{fields('contact')} *
					</label>
					<input
						id='lead-contact'
						name='contact'
						inputMode={contactMethod === 'Email' ? 'email' : contactMethod === 'Phone' ? 'tel' : 'text'}
						required
						className={fieldClassName}
						aria-invalid={Boolean(fieldErrors.contact)}
						aria-describedby={`lead-contact-hint${fieldErrors.contact ? ' lead-contact-error' : ''}`}
					/>
					<p id='lead-contact-hint' className='mt-2 text-xs text-zinc-400'>
						{contactMethod === 'Email' ? t('emailHint') : contactMethod === 'Phone' ? t('phoneHint') : contactMethod === 'Telegram' ? t('telegramHint') : t('contactHint')}
					</p>
					<FieldError id='lead-contact-error' messages={fieldErrors.contact} />
				</div>
				<div>
					<label htmlFor='lead-service' className={labelClassName}>
						{fields('service')} *
					</label>
					<select
						id='lead-service'
						name='service'
						defaultValue=''
						required
						className={fieldClassName}
						aria-invalid={Boolean(fieldErrors.service)}
						aria-describedby={
							fieldErrors.service ? 'lead-service-error' : undefined
						}
					>
						<option value='' disabled>
							{t('chooseService')}
						</option>
						{services.map(service => (
							<option key={service} value={service}>
								{serviceLabels(service === 'Web Application' ? 'WebApplication' : service === 'AI Automation' ? 'AIAutomation' : service)}
							</option>
						))}
					</select>
					<FieldError id='lead-service-error' messages={fieldErrors.service} />
				</div>
				<div className='sm:col-span-2'>
					<label htmlFor='lead-budget' className={labelClassName}>
						{fields('budget')} <span className='font-normal text-zinc-400'>({common('optional')})</span>
					</label>
					<input
						id='lead-budget'
						name='budget'
						placeholder={t('budgetPlaceholder')}
						className={fieldClassName}
						aria-invalid={Boolean(fieldErrors.budget)}
						aria-describedby={
							fieldErrors.budget ? 'lead-budget-error' : undefined
						}
					/>
					<FieldError id='lead-budget-error' messages={fieldErrors.budget} />
				</div>
				<div className='sm:col-span-2'>
					<label htmlFor='lead-message' className={labelClassName}>
						{fields('message')}{' '}
						<span className='font-normal text-zinc-400'>({common('optional')})</span>
					</label>
					<textarea
						id='lead-message'
						name='message'
						rows={5}
						maxLength={1000}
						className={`${fieldClassName} resize-y`}
						aria-invalid={Boolean(fieldErrors.message)}
						aria-describedby={`lead-message-hint${fieldErrors.message ? ' lead-message-error' : ''}`}
					/>
					<p id='lead-message-hint' className='mt-2 text-xs text-zinc-400'>
						{t('messageHint')}
					</p>
					<FieldError id='lead-message-error' messages={fieldErrors.message} />
				</div>
			</fieldset>
			<div
				ref={feedbackRef}
				tabIndex={-1}
				role='status'
				aria-live='polite'
				aria-atomic='true'
				className={feedback ? `mt-6 flex gap-3 rounded-xl border p-4 text-sm leading-6 ${feedback.kind === 'success' ? 'border-teal-300/30 bg-teal-300/5 text-teal-200' : 'border-red-300/30 bg-red-300/5 text-red-200'}` : 'sr-only'}
			>
				{feedback && (
					<>
						<svg aria-hidden='true' focusable='false' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' className='mt-0.5 size-5 shrink-0'>
							<circle cx='12' cy='12' r='9' />
							{feedback.kind === 'success' ? <path d='m8 12 3 3 5-6' /> : <path d='M12 7v6m0 4h.01' />}
						</svg>
						<div>
							<p className='font-semibold'>{common(feedback.kind)}</p>
							<p className='mt-1'>{feedback.message}</p>
						</div>
					</>
				)}
			</div>
			<button
				type='submit'
				disabled={isSubmitting}
				className='mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-teal-300 px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-teal-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300 disabled:cursor-wait disabled:opacity-60'
			>
				{isSubmitting ? t('sending') : t('send')}
			</button>
		</form>
	)
}
