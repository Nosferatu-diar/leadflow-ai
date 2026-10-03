'use client'

import { useRef, useState } from 'react'
import type { FormEvent } from 'react'

export function LoginForm({ configured }: { configured: boolean }) {
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const inProgress = useRef(false)
	const errorRef = useRef<HTMLParagraphElement>(null)

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
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
			})
			const data = await response.json()
			if (!response.ok || data.success !== true) {
				setError(typeof data.message === 'string' ? data.message : 'Unable to sign in. Please try again.')
				return
			}
			// A full navigation drops any previously cached admin UI on sign-in.
			navigating = true
			window.location.replace('/dashboard')
		} catch {
			setError('Unable to sign in. Check your connection and try again.')
		} finally {
			if (!navigating) {
				inProgress.current = false
				setBusy(false)
				errorRef.current?.focus()
			}
		}
	}

	const fieldClass = 'mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300'
	return (
		<form onSubmit={handleSubmit} aria-busy={busy} className='mt-8 space-y-6'>
			{!configured && <p role='status' className='text-sm text-amber-200'>Admin sign-in is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH and AUTH_SECRET on the server.</p>}
			<fieldset disabled={busy || !configured} className='space-y-6'>
				<legend className='sr-only'>Admin credentials</legend>
				<div><label htmlFor='admin-email' className='text-sm font-medium'>Email</label><input id='admin-email' name='email' type='email' autoComplete='username' required maxLength={254} className={fieldClass} /></div>
				<div><label htmlFor='admin-password' className='text-sm font-medium'>Password</label><input id='admin-password' name='password' type='password' autoComplete='current-password' required maxLength={72} className={fieldClass} /></div>
				<button type='submit' className='min-h-12 w-full rounded-lg bg-teal-300 px-6 text-sm font-semibold text-zinc-950 hover:bg-teal-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300 disabled:opacity-60' disabled={busy || !configured}>{busy ? 'Signing in...' : 'Sign In'}</button>
			</fieldset>
			<p ref={errorRef} tabIndex={-1} role='status' aria-live='polite' className='text-sm text-red-300'>{error}</p>
		</form>
	)
}
