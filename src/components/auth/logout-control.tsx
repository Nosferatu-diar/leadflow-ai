'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import { useLocale, useTranslations } from 'next-intl'

export function LogoutControl() {
	const locale = useLocale()
	const t = useTranslations('Auth')
	const id = useId()
	const dialogRef = useRef<HTMLDialogElement>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const cancelRef = useRef<HTMLButtonElement>(null)
	const confirmRef = useRef<HTMLButtonElement>(null)
	const submittingRef = useRef(false)
	const [submitting, setSubmitting] = useState(false)
	const buttonClass = 'inline-flex min-h-12 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-semibold transition-colors hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-60'

	function openDialog() {
		dialogRef.current?.showModal()
		cancelRef.current?.focus()
	}

	function confirmLogout(event: FormEvent<HTMLFormElement>) {
		if (submittingRef.current) {
			event.preventDefault()
			return
		}
		submittingRef.current = true
		setSubmitting(true)
		// Native POST preserves the existing server-side Origin check and redirect.
	}

	return (
		<>
			<button ref={triggerRef} type='button' onClick={openDialog} aria-haspopup='dialog' className={buttonClass}>{t('logout')}</button>
			<dialog ref={dialogRef} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} onCancel={event => { if (submittingRef.current) event.preventDefault() }} onClose={() => triggerRef.current?.focus()} onKeyDown={event => {
				// Keep Tab/Shift+Tab cycling between the two confirmation controls.
				if (event.key !== 'Tab' || submittingRef.current) return
				if (event.shiftKey && document.activeElement === cancelRef.current) {
					event.preventDefault()
					confirmRef.current?.focus()
				} else if (!event.shiftKey && document.activeElement === confirmRef.current) {
					event.preventDefault()
					cancelRef.current?.focus()
				}
			}} className='m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-6 text-zinc-100 shadow-2xl backdrop:bg-black/75 sm:p-8'>
				<h2 id={`${id}-title`} className='text-2xl font-semibold tracking-tight'>{t('logoutTitle')}</h2>
				<p id={`${id}-description`} className='mt-3 text-sm leading-6 text-zinc-300'>{t('logoutDescription')}</p>
				<form action={`/api/auth/logout?locale=${locale}`} method='post' onSubmit={confirmLogout} aria-busy={submitting} className='mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
					<button ref={cancelRef} type='button' disabled={submitting} onClick={() => dialogRef.current?.close()} className={buttonClass}>{t('logoutCancel')}</button>
					<button ref={confirmRef} type='submit' disabled={submitting} className='inline-flex min-h-12 items-center justify-center rounded-lg border border-teal-300 bg-teal-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-teal-200 disabled:cursor-wait disabled:opacity-60'>{submitting ? t('signingOut') : t('logoutConfirm')}</button>
				</form>
			</dialog>
		</>
	)
}
