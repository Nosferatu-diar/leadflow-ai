import type { Lead } from '@prisma/client'
import { AnalyzeButton } from './analyze-button'

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
	dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC',
})

export function LeadAnalysis({ lead }: { lead: Lead }) {
	return (
		<div>
			{lead.aiAnalyzedAt && (
				<details className='mt-4 text-sm font-normal'>
					<summary className='w-fit cursor-pointer text-teal-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300'>AI analysis · {lead.aiPriority}</summary>
					<dl className='mt-3 space-y-3 wrap-anywhere text-zinc-300'>
						{[
							['AI Summary', lead.aiSummary],
							['Priority', lead.aiPriority],
							['Intent', lead.aiIntent],
							['Suggested Reply', lead.aiSuggestedReply],
						].map(([label, value]) => (
							<div key={label}>
								<dt className='font-medium text-zinc-100'>{label}</dt>
								<dd className='mt-1 whitespace-pre-wrap leading-6'>{value}</dd>
							</div>
						))}
						<div>
							<dt className='font-medium text-zinc-100'>Analysis date</dt>
							<dd className='mt-1'><time dateTime={lead.aiAnalyzedAt.toISOString()}>{dateFormatter.format(lead.aiAnalyzedAt)} UTC</time></dd>
						</div>
					</dl>
				</details>
			)}
			<AnalyzeButton leadId={lead.id} analyzed={Boolean(lead.aiAnalyzedAt)} />
		</div>
	)
}
