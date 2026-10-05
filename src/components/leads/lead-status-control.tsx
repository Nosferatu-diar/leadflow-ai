'use client'

import { useLocale, useTranslations } from 'next-intl'

import { leadStatuses } from '@/lib/lead-status'
import type { LeadStatus } from '@prisma/client'
import { useRouter } from '@/i18n/navigation'
import { useId, useRef, useState, useTransition } from 'react'

export function LeadStatusControl({ leadId, status, name }: { leadId: string; status: LeadStatus; name: string }) {
	const locale = useLocale()
	const t = useTranslations('Status')
	const labels = useTranslations('Statuses')
	const router = useRouter()
	const id = useId()
	const [isUpdating, setIsUpdating] = useState(false)
	const [isRefreshing, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)
	const requestInProgress = useRef(false)
	const busy = isUpdating || isRefreshing

	async function updateStatus(nextStatus: string) {
		if (requestInProgress.current || busy || nextStatus === status) return
		requestInProgress.current = true
		setIsUpdating(true)
		setError(null)
		try {
			const response = await fetch(`/api/leads/${encodeURIComponent(leadId)}/status`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json', 'x-leadflow-locale': locale },
				body: JSON.stringify({ status: nextStatus }),
			})
			const data = await response.json()
			if (!response.ok || data.success !== true) {
				setError(typeof data.message === 'string' ? data.message : t('failed'))
				return
			}
			startTransition(() => router.refresh())
		} catch {
			setError(t('connection'))
		} finally {
			requestInProgress.current = false
			setIsUpdating(false)
		}
	}

	return (
		<div className='min-w-0 space-y-2' aria-busy={busy}>
			<span className='inline-flex rounded-full border border-teal-300/30 bg-teal-300/10 px-2.5 py-1 text-xs font-medium text-teal-200'>{labels(status)}</span>
			<label htmlFor={id} className='sr-only'>{t('label', { name })}</label>
			<select id={id} value={status} onChange={event => void updateStatus(event.target.value)} disabled={busy} aria-describedby={`${id}-feedback`} className='block min-h-12 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-base sm:text-sm font-normal text-zinc-200 transition-colors hover:border-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 disabled:cursor-wait disabled:opacity-60'>
				{leadStatuses.map(value => <option key={value} value={value}>{labels(value)}</option>)}
			</select>
			<p id={`${id}-feedback`} role='status' className={`text-xs font-normal ${error ? 'text-red-300' : 'text-zinc-400'}`}>{error || (busy ? t('updating') : '')}</p>
		</div>
	)
}
