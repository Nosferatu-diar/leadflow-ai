'use client'

import { leadStatuses, statusLabels } from '@/lib/lead-status'
import type { LeadStatus } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useId, useRef, useState, useTransition } from 'react'

export function LeadStatusControl({ leadId, status, name }: { leadId: string; status: LeadStatus; name: string }) {
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
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: nextStatus }),
			})
			const data = await response.json()
			if (!response.ok || data.success !== true) {
				setError(typeof data.message === 'string' ? data.message : 'Unable to update the status. Please try again.')
				return
			}
			startTransition(() => router.refresh())
		} catch {
			setError('Unable to update the status. Check your connection and try again.')
		} finally {
			requestInProgress.current = false
			setIsUpdating(false)
		}
	}

	return (
		<div className='space-y-2' aria-busy={busy}>
			<span className='inline-flex rounded-full border border-teal-300/30 bg-teal-300/10 px-2.5 py-1 text-xs font-medium text-teal-200'>{statusLabels[status]}</span>
			<label htmlFor={id} className='sr-only'>Status for {name}</label>
			<select id={id} value={status} onChange={event => void updateStatus(event.target.value)} disabled={busy} aria-describedby={`${id}-feedback`} className='block min-h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm font-normal text-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 disabled:cursor-wait disabled:opacity-60'>
				{leadStatuses.map(value => <option key={value} value={value}>{statusLabels[value]}</option>)}
			</select>
			<p id={`${id}-feedback`} role='status' className={`text-xs font-normal ${error ? 'text-red-300' : 'text-zinc-400'}`}>{error || (busy ? 'Updating...' : '')}</p>
		</div>
	)
}
