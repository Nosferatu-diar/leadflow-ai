'use client'

import { useLocale, useTranslations } from 'next-intl'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from '@/i18n/navigation'

export function AnalyzeButton({ leadId, analyzed }: { leadId: string; analyzed: boolean }) {
	const locale = useLocale()
	const t = useTranslations('AI')
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
			const response = await fetch(`/api/leads/${encodeURIComponent(leadId)}/analyze`, { method: 'POST', headers: { 'x-leadflow-locale': locale } })
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
			setIsAnalyzing(false)
		}
	}

	return (
		<div className='mt-3 first:mt-0'>
			<button type='button' onClick={handleAnalyze} disabled={busy} aria-busy={busy} className='min-h-11 w-full rounded-lg sm:w-auto border border-teal-300/40 px-4 py-2.5 text-sm font-medium text-teal-300 transition-colors hover:bg-teal-300/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300 disabled:cursor-wait disabled:opacity-60'>
				{busy ? t('analyzing') : analyzed ? t('reanalyze') : t('analyze')}
			</button>
			<p role='status' aria-live='polite' className='mt-2 text-sm font-normal text-red-300'>{error}</p>
		</div>
	)
}
