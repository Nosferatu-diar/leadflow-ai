import type { Lead } from '@prisma/client'
import { AnalyzeButton } from './analyze-button'

import { useFormatter, useTranslations } from 'next-intl'

export function LeadAnalysis({ lead }: { lead: Lead }) {
	const t = useTranslations('AI')
	const priority = useTranslations('Priorities')
	const common = useTranslations('Common')
	const format = useFormatter()

	return (
		<div className='mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4'>
			{lead.aiAnalyzedAt && (
				<details className='text-sm font-normal'>
					<summary className='min-h-11 w-fit cursor-pointer content-center rounded-md text-teal-300 hover:text-teal-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300'>{t('title')} · {lead.aiPriority ? priority(lead.aiPriority) : common('notProvided')}</summary>
					<dl className='mt-3 space-y-4 border-t border-zinc-800 pt-4 wrap-anywhere text-zinc-300'>
						{[
							[t('summary'), lead.aiSummary],
							[t('priority'), lead.aiPriority ? priority(lead.aiPriority) : common('notProvided')],
							[t('intent'), lead.aiIntent],
							[t('reply'), lead.aiSuggestedReply],
						].map(([label, value]) => (
							<div key={label}>
								<dt className='font-medium text-zinc-100'>{label}</dt>
								<dd className='mt-1 whitespace-pre-wrap leading-6'>{value}</dd>
							</div>
						))}
						<div>
							<dt className='font-medium text-zinc-100'>{t('date')}</dt>
							<dd className='mt-1'><time dateTime={lead.aiAnalyzedAt.toISOString()}>{format.dateTime(lead.aiAnalyzedAt, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC</time></dd>
						</div>
					</dl>
				</details>
			)}
			<AnalyzeButton leadId={lead.id} analyzed={Boolean(lead.aiAnalyzedAt)} />
		</div>
	)
}
