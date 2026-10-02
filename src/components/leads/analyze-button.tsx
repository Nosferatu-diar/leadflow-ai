'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function AnalyzeButton({ leadId, analyzed }: { leadId: string; analyzed: boolean }) {
	const router = useRouter()
	const [isAnalyzing, setIsAnalyzing] = useState(false)
	const [isRefreshing, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)
	const requestInProgress = useRef(false)
	const busy = isAnalyzing || isRefreshing

	async function handleAnalyze() {
		if (requestInProgress.current || busy) return
		requestInProgress.current = true
		setIsAnalyzing(true)
		setError(null)
		try {
			const response = await fetch(`/api/leads/${encodeURIComponent(leadId)}/analyze`, { method: 'POST' })
			const data = await response.json()
			if (!response.ok || data.success !== true) {
				setError(typeof data.message === 'string' ? data.message : 'Unable to analyze this lead. Please try again.')
				return
			}
			startTransition(() => router.refresh())
		} catch {
			setError('Unable to analyze this lead. Check your connection and try again.')
		} finally {
			requestInProgress.current = false
			setIsAnalyzing(false)
		}
	}

	return (
		<div className='mt-4'>
			<button type='button' onClick={handleAnalyze} disabled={busy} aria-busy={busy} className='min-h-11 rounded-lg border border-teal-300/40 px-3 py-2 text-sm font-medium text-teal-300 hover:bg-teal-300/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300 disabled:cursor-wait disabled:opacity-60'>
				{busy ? 'Analyzing...' : analyzed ? 'Re-analyze' : 'Analyze with AI'}
			</button>
			<p role='status' aria-live='polite' className='mt-2 text-sm font-normal text-red-300'>{error}</p>
		</div>
	)
}
