'use client'

import { createContext, useContext, useEffect, useId, useRef, useState, useTransition, type ReactNode } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'

const DeletionFeedbackContext = createContext<((message: string) => void) | null>(null)

// This region survives row removal and refresh, including deletion of the last lead.
export function LeadDeletionFeedbackProvider({ children }: { children: ReactNode }) {
	const [message, setMessage] = useState('')
	const feedbackRef = useRef<HTMLParagraphElement>(null)
	useEffect(() => {
		if (message) feedbackRef.current?.focus()
	}, [message])

	return (
		<DeletionFeedbackContext.Provider value={setMessage}>
			<p ref={feedbackRef} role='status' aria-live='polite' aria-atomic='true' tabIndex={-1} className={message ? 'mb-5 rounded-xl border border-teal-300/30 bg-teal-300/5 p-4 text-sm leading-6 wrap-anywhere text-teal-200' : 'sr-only'}>{message}</p>
			{children}
		</DeletionFeedbackContext.Provider>
	)
}

export function DeleteLeadControl({ leadId, name }: { leadId: string; name: string }) {
	const locale = useLocale()
	const t = useTranslations('DeleteLead')
	const router = useRouter()
	const showSuccess = useContext(DeletionFeedbackContext)
	const id = useId()
	const dialogRef = useRef<HTMLDialogElement>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const cancelRef = useRef<HTMLButtonElement>(null)
	const confirmRef = useRef<HTMLButtonElement>(null)
	const errorRef = useRef<HTMLParagraphElement>(null)
	const requestInProgress = useRef(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isRefreshing, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)
	const busy = isDeleting || isRefreshing
	useEffect(() => {
		if (error) errorRef.current?.focus()
	}, [error])

	function openDialog() {
		setError(null)
		dialogRef.current?.showModal()
		cancelRef.current?.focus()
	}

	async function deleteLead() {
		if (requestInProgress.current || busy) return
		requestInProgress.current = true
		setIsDeleting(true)
		setError(null)
		dialogRef.current?.focus()
		try {
			const response = await fetch(`/api/leads/${encodeURIComponent(leadId)}`, {
				method: 'DELETE',
				headers: { 'x-leadflow-locale': locale },
			})
			const data = await response.json()
			if (!response.ok || data.success !== true) {
				setError(typeof data.message === 'string' ? data.message : t('failed'))
				return
			}
			dialogRef.current?.close()
			showSuccess?.(t('success', { name }))
			startTransition(() => router.refresh())
		} catch {
			setError(t('connection'))
		} finally {
			requestInProgress.current = false
			setIsDeleting(false)
		}
	}

	return (
		<>
			<button ref={triggerRef} type='button' onClick={openDialog} disabled={busy} aria-haspopup='dialog' aria-label={t('label', { name })} className='inline-flex min-h-11 items-center justify-center rounded-lg border border-red-300/30 px-4 py-2.5 text-sm font-medium text-red-200 transition-colors hover:border-red-300/60 hover:bg-red-300/10 disabled:cursor-wait disabled:opacity-60'>{t('button')}</button>
			<dialog ref={dialogRef} tabIndex={-1} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} aria-busy={busy} onCancel={event => { if (requestInProgress.current) event.preventDefault() }} onClose={() => triggerRef.current?.focus()} onKeyDown={event => {
				if (event.key !== 'Tab') return
				if (busy) {
					event.preventDefault()
				} else if (event.shiftKey && document.activeElement === cancelRef.current) {
					event.preventDefault()
					confirmRef.current?.focus()
				} else if (!event.shiftKey && document.activeElement === confirmRef.current) {
					event.preventDefault()
					cancelRef.current?.focus()
				}
			}} className='m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-6 text-zinc-100 shadow-2xl backdrop:bg-black/75 sm:p-8'>
				<h2 id={`${id}-title`} className='text-2xl font-semibold tracking-tight'>{t('title')}</h2>
				<p id={`${id}-description`} className='mt-3 text-sm leading-6 wrap-anywhere text-zinc-300'>{t('description', { name })}</p>
				<p ref={errorRef} role='status' aria-live='polite' aria-atomic='true' tabIndex={-1} className={error ? 'mt-5 rounded-lg border border-red-300/30 bg-red-300/5 p-4 text-sm leading-6 text-red-200' : 'sr-only'}>{error}</p>
				<p role='status' aria-live='polite' className={busy ? 'mt-4 text-sm text-zinc-300' : 'sr-only'}>{busy ? t('deleting') : ''}</p>
				<div className='mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
					<button ref={cancelRef} type='button' disabled={busy} onClick={() => dialogRef.current?.close()} className='inline-flex min-h-12 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-semibold transition-colors hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-60'>{t('cancel')}</button>
					<button ref={confirmRef} type='button' disabled={busy} onClick={() => void deleteLead()} className='inline-flex min-h-12 items-center justify-center rounded-lg border border-red-300 bg-red-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-red-200 disabled:cursor-wait disabled:opacity-60'>{busy ? t('deleting') : t('confirm')}</button>
				</div>
			</dialog>
		</>
	)
}
