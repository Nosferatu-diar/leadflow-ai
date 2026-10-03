import type { Lead } from '@prisma/client'
import { LeadAnalysis } from './lead-analysis'
import { Fragment } from 'react'
import { LeadStatusControl } from './lead-status-control'

const serviceLabels: Record<Lead['service'], string> = {
	Website: 'Website',
	WebApplication: 'Web Application',
	AIAutomation: 'AI Automation',
	Other: 'Other',
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
	day: '2-digit', month: 'short', year: 'numeric',
	hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
})

function CreatedAt({ date }: { date: Date }) {
	return <time dateTime={date.toISOString()}>{dateFormatter.format(date)}</time>
}

function MessageDetails({ message }: { message: string | null }) {
	if (!message) return null
	return (
		<details className='mt-3 text-sm'>
			<summary className='w-fit cursor-pointer text-teal-300 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300'>View message</summary>
			<p className='mt-3 whitespace-pre-wrap wrap-anywhere leading-6 text-zinc-300'>{message}</p>
		</details>
	)
}

export function LeadsList({ leads }: { leads: Lead[] }) {
	return (
		<>
			<div className='hidden overflow-hidden rounded-2xl border border-zinc-800 md:block'>
				<table className='w-full table-fixed text-left text-sm'>
					<caption className='sr-only'>All submitted leads, newest first. Expand a name cell to view its message. Dates are in UTC.</caption>
					<thead className='bg-zinc-900 text-xs text-zinc-400'>
						<tr>
							{['Name', 'Contact Method', 'Contact', 'Service', 'Budget', 'Created At', 'Status'].map(column => (
								<th key={column} scope='col' className='px-4 py-4 font-medium'>{column}</th>
							))}
						</tr>
					</thead>
					<tbody className='divide-y divide-zinc-800'>
						{leads.map(lead => (
							<Fragment key={lead.id}>
							<tr className='align-top'>
								<th scope='row' className='px-4 py-5 font-normal wrap-anywhere'>
									<span className='font-medium text-zinc-100'>{lead.name}</span>
									<MessageDetails message={lead.message} />
								</th>
								<td className='px-4 py-5 text-zinc-300'>{lead.contactMethod}</td>
								<td className='px-4 py-5 wrap-anywhere text-zinc-300'>{lead.contact}</td>
								<td className='px-4 py-5 text-zinc-300'>{serviceLabels[lead.service]}</td>
								<td className='px-4 py-5 wrap-anywhere text-zinc-300'>{lead.budget || 'Not provided'}</td>
								<td className='px-4 py-5 text-zinc-400'><CreatedAt date={lead.createdAt} /></td>
								<td className='px-4 py-5'><LeadStatusControl leadId={lead.id} status={lead.status} name={lead.name} /></td>
							</tr>
							<tr>
								<td colSpan={7} className='px-4 pb-5'>
									<LeadAnalysis lead={lead} />
								</td>
							</tr>
							</Fragment>
						))}
					</tbody>
					</table>
				</div>

			<ul aria-label='Submitted leads' className='space-y-4 md:hidden'>
				{leads.map(lead => (
					<li key={lead.id}>
						<article className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6'>
							<h3 className='mb-5 text-lg font-semibold wrap-anywhere'>{lead.name}</h3>
							<dl className='space-y-3 text-sm'>
								{[
									['Contact Method', lead.contactMethod],
									['Contact', lead.contact],
									['Service', serviceLabels[lead.service]],
									['Budget', lead.budget || 'Not provided'],
								].map(([label, value]) => (
									<div key={label} className='grid grid-cols-[7rem_minmax(0,1fr)] gap-3'>
										<dt className='text-zinc-400'>{label}</dt>
										<dd className='wrap-anywhere text-zinc-200'>{value}</dd>
									</div>
								))}
								<div className='grid grid-cols-[7rem_minmax(0,1fr)] gap-3'>
									<dt className='text-zinc-400'>Created At</dt>
									<dd className='text-zinc-200'><CreatedAt date={lead.createdAt} /></dd>
								</div>
							</dl>
							<MessageDetails message={lead.message} />
							<div className='mt-5'><LeadStatusControl leadId={lead.id} status={lead.status} name={lead.name} /></div>
							<LeadAnalysis lead={lead} />
						</article>
					</li>
					))}
				</ul>
			</>
	)
}
