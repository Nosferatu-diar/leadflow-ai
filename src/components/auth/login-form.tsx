'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { FormEvent } from 'react'

export function LoginForm({ configured }: { configured: boolean }) {
	const locale = useLocale()
	const t = useTranslations('Auth')
	const [busy, setBusy] = useState(false)
	const [passwordVisible, setPasswordVisible] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const inProgress = useRef(false)
	const errorRef = useRef<HTMLParagraphElement>(null)
	useEffect(() => {
		if (error) errorRef.current?.focus()
	}, [error])

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (inProgress.current || !configured) return
		inProgress.current = true
		setBusy(true)
		setError(null)
		const form = new FormData(event.currentTarget)
		let navigating = false
		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST', headers: { 'Content-Type': 'application/json', 'x-leadflow-locale': locale },
				body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
			})
			const data = await response.json()
			if (!response.ok || data.success !== true) {
				setError(typeof data.message === 'string' ? data.message : t('failed'))
				return
			}
			// A full navigation drops any previously cached admin UI on sign-in.
			navigating = true
			window.location.replace(`/${locale}/dashboard`)
		} catch {
			setError(t('connection'))
		} finally {
			if (!navigating) {
				inProgress.current = false
				setBusy(false)
			}
		}
	}

	const fieldClass = 'min-h-12 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-zinc-100 transition-colors hover:border-zinc-600 focus-visible:border-teal-300 sm:text-sm'
	return (
		<form onSubmit={handleSubmit} aria-busy={busy} className='mt-8 space-y-6'>
			{!configured && <p role='status' className='rounded-lg border border-amber-300/25 bg-amber-300/5 p-4 text-sm leading-6 text-amber-200'>{t('setup')}</p>}
			<fieldset disabled={busy || !configured} className='space-y-6'>
				<legend className='sr-only'>{t('legend')}</legend>
				<div className='space-y-2'><label htmlFor='admin-email' className='block text-sm font-medium text-zinc-200'>{t('email')}</label><input id='admin-email' name='email' type='email' autoComplete='username' required maxLength={254} className={fieldClass} /></div>
				<div className='space-y-2'>
					<label htmlFor='admin-password' className='block text-sm font-medium text-zinc-200'>{t('password')}</label>
					<div className='relative'>
						<input id='admin-password' name='password' type={passwordVisible ? 'text' : 'password'} autoComplete='current-password' required maxLength={72} className={`${fieldClass} pr-14`} />
						<button type='button' onClick={() => setPasswordVisible(visible => !visible)} aria-label={passwordVisible ? t('hidePassword') : t('showPassword')} aria-controls='admin-password' className='absolute right-1 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50'>
							<svg aria-hidden='true' focusable='false' viewBox='0 0 24 24' className='size-5' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round'>
								{passwordVisible ? <><path d='m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A11 11 0 0 1 12 5c5.5 0 9 7 9 7a16 16 0 0 1-3.1 4.1M6.1 6.1C4.1 7.6 3 10 3 12c0 0 3.5 7 9 7a10 10 0 0 0 4-1' /></> : <><path d='M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z' /><circle cx='12' cy='12' r='3' /></>}
							</svg>
						</button>
					</div>
				</div>
				<button type='submit' className='min-h-12 w-full rounded-lg bg-teal-300 px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-teal-200 disabled:cursor-wait disabled:opacity-60' disabled={busy || !configured}>{busy ? t('signingIn') : t('signIn')}</button>
			</fieldset>
			<p ref={errorRef} tabIndex={-1} role='status' aria-live='polite' aria-atomic='true' className={error ? 'rounded-lg border border-red-300/25 bg-red-300/5 p-4 text-sm leading-6 text-red-200' : 'sr-only'}>{error}</p>
		</form>
	)
}
