import type { Lead } from '@prisma/client'
import { LeadAnalysis } from './lead-analysis'
import { Fragment } from 'react'
import { LeadStatusControl } from './lead-status-control'
import { DeleteLeadControl } from './delete-lead-control'

import { useTranslations, useFormatter } from 'next-intl'

function CreatedAt({ date }: { date: Date }) {
	const format = useFormatter()
	return <time dateTime={date.toISOString()}>{format.dateTime(date, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}</time>
}

function MessageDetails({ message }: { message: string | null }) {
	const t = useTranslations('Dashboard')
	if (!message) return null
	return (
		<details className='mt-2 text-sm'>
			<summary className='min-h-11 w-fit cursor-pointer content-center rounded-md text-teal-300 hover:text-teal-200 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300'>{t('viewMessage')}</summary>
			<p className='mt-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3 whitespace-pre-wrap wrap-anywhere leading-6 text-zinc-300'>{message}</p>
		</details>
	)
}

export function LeadsList({ leads }: { leads: Lead[] }) {
	const t = useTranslations('Dashboard')
	const fields = useTranslations('Fields')
	const common = useTranslations('Common')
	const services = useTranslations('Services')
	const methods = useTranslations('ContactMethods')
	return (
		<>
			<div className='hidden overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30 xl:block'>
				<table className='w-full table-fixed text-left text-sm'>
					<caption className='sr-only'>{t('tableCaption')}</caption>
					<colgroup>{['16%', '12%', '15%', '14%', '10%', '14%', '19%'].map((width, index) => <col key={index} style={{ width }} />)}</colgroup>
					<thead className='bg-zinc-900 text-xs leading-5 text-zinc-300'>
						<tr>
							{['name', 'contactMethod', 'contact', 'service', 'budget', 'createdAt', 'status'].map(column => (
								<th key={fields(column)} scope='col' className='px-4 py-4 font-medium'>{fields(column)}</th>
							))}
						</tr>
					</thead>
					<tbody className='divide-y divide-zinc-800'>
						{leads.map(lead => (
							<Fragment key={lead.id}>
							<tr className='align-top transition-colors hover:bg-zinc-900/60'>
								<th scope='row' className='px-4 py-5 font-normal wrap-anywhere'>
									<span className='font-medium text-zinc-100'>{lead.name}</span>
									<MessageDetails message={lead.message} />
								</th>
								<td className='px-4 py-5 leading-6 text-zinc-300'>{methods(lead.contactMethod)}</td>
								<td className='px-4 py-5 wrap-anywhere text-zinc-300'>{lead.contact}</td>
								<td className='px-4 py-5 leading-6 text-zinc-300'>{services(lead.service)}</td>
								<td className='px-4 py-5 wrap-anywhere text-zinc-300'>{lead.budget || common('notProvided')}</td>
								<td className='px-4 py-5 text-xs leading-6 text-zinc-400'><CreatedAt date={lead.createdAt} /></td>
								<td className='px-4 py-5'><LeadStatusControl leadId={lead.id} status={lead.status} name={lead.name} /></td>
							</tr>
							<tr>
								<td colSpan={7} className='px-4 pb-5'>
									<LeadAnalysis lead={lead} />
									<div className='mt-3 flex justify-end'><DeleteLeadControl leadId={lead.id} name={lead.name} /></div>
								</td>
							</tr>
							</Fragment>
						))}
					</tbody>
					</table>
				</div>

			<ul aria-label={t('list')} className='grid min-w-0 gap-4 md:grid-cols-2 xl:hidden'>
				{leads.map(lead => (
					<li key={lead.id} className='min-w-0'>
						<article className='h-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6'>
							<h3 className='mb-5 text-lg font-semibold wrap-anywhere'>{lead.name}</h3>
							<dl className='space-y-3 text-sm'>
								{[
									[fields('contactMethod'), methods(lead.contactMethod)],
									[fields('contact'), lead.contact],
									[fields('service'), services(lead.service)],
									[fields('budget'), lead.budget || common('notProvided')],
								].map(([label, value]) => (
									<div key={label} className='grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3'>
										<dt className='wrap-anywhere leading-6 text-zinc-400'>{label}</dt>
										<dd className='wrap-anywhere leading-6 text-zinc-200'>{value}</dd>
									</div>
								))}
								<div className='grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3'>
									<dt className='text-zinc-400'>{fields('createdAt')}</dt>
									<dd className='text-zinc-200'><CreatedAt date={lead.createdAt} /></dd>
								</div>
							</dl>
							<MessageDetails message={lead.message} />
							<div className='mt-5 border-t border-zinc-800 pt-5'><LeadStatusControl leadId={lead.id} status={lead.status} name={lead.name} /></div>
							<LeadAnalysis lead={lead} />
							<div className='mt-4 flex justify-end'><DeleteLeadControl leadId={lead.id} name={lead.name} /></div>
						</article>
					</li>
					))}
				</ul>
			</>
	)
}
