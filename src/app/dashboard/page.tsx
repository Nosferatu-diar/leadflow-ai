import { LeadsList } from '@/components/leads/leads-list'
import { ActionLink } from '@/components/ui/action-link'
import { prisma } from '@/lib/prisma'
import type { Lead } from '@prisma/client'
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { leadStatuses, statusLabels } from '@/lib/lead-status'
import { requireAdmin } from '@/lib/auth/session'

export const metadata: Metadata = {
	title: 'Leads Dashboard | LeadFlow AI',
	robots: { index: false, follow: false },
}

export default async function DashboardPage() {
	await requireAdmin()
	// Query fresh data at request time instead of during the production build.
	await connection()

	let leads: Lead[] | null = null
	try {
		leads = await prisma.lead.findMany({
			orderBy: { createdAt: 'desc' },
		})
	} catch {
		console.error('Unable to load leads dashboard.')
	}

	const serviceCounts = { Website: 0, WebApplication: 0, AIAutomation: 0, Other: 0 }
	const statusCounts = { NEW: 0, CONTACTED: 0, QUALIFIED: 0, WON: 0, LOST: 0 }
	for (const lead of leads ?? []) {
		serviceCounts[lead.service] += 1
		statusCounts[lead.status] += 1
	}
	const stats = [
		{ label: 'Total Leads', value: leads?.length ?? 0 },
		{ label: 'Website leads', value: serviceCounts.Website },
		{ label: 'Web Application leads', value: serviceCounts.WebApplication },
		{ label: 'AI Automation leads', value: serviceCounts.AIAutomation },
	]

	return (
		<main id='main-content' className='mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 sm:py-16'>
			<header className='mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<p className='mb-3 text-sm font-medium tracking-widest text-teal-300'>LeadFlow AI</p>
					<h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>Leads Dashboard</h1>
					<p className='mt-3 text-sm text-zinc-400'>
						{leads === null ? 'Lead count unavailable.' : `${leads.length} ${leads.length === 1 ? 'lead' : 'leads'} received · Newest first`}
					</p>
				</div>
				<div className='flex flex-wrap items-center gap-3'>
					<ActionLink href='/' variant='secondary'>Back to public website</ActionLink>
					<form action='/api/auth/logout' method='post'>
						<button type='submit' className='min-h-12 rounded-lg border border-zinc-700 px-4 text-sm font-medium hover:bg-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300'>Logout</button>
					</form>
				</div>
			</header>

			{leads === null ? (
				<section aria-labelledby='dashboard-error-heading' className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8'>
					<h2 id='dashboard-error-heading' className='text-xl font-semibold'>Unable to load leads.</h2>
					<p className='mt-3 text-sm leading-6 text-zinc-400'>Please try again later. Your saved leads have not been changed.</p>
				</section>
			) : (
				<>
					<dl aria-label='Lead statistics' className='mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
						{stats.map(stat => (
							<div key={stat.label} className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6'>
								<dt className='text-sm text-zinc-400'>{stat.label}</dt>
								<dd className='mt-3 text-3xl font-semibold tabular-nums'>{stat.value}</dd>
							</div>
						))}
					</dl>
					<dl aria-label='Lead status overview' className='mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'>
						{leadStatuses.map(status => (
							<div key={status} className='rounded-xl border border-zinc-800 px-5 py-4'>
								<dt className='text-sm text-zinc-400'>{statusLabels[status]}</dt>
								<dd className='mt-2 text-2xl font-semibold tabular-nums'>{statusCounts[status]}</dd>
							</div>
						))}
					</dl>
					<section aria-labelledby='all-leads-heading'>
						<div className='mb-5 flex flex-wrap items-baseline justify-between gap-2'>
							<h2 id='all-leads-heading' className='text-xl font-semibold'>All leads</h2>
							<p className='text-xs text-zinc-400'>Dates shown in UTC</p>
						</div>
						{leads.length === 0 ? (
							<div className='rounded-2xl border border-dashed border-zinc-700 p-10 text-center'>
								<h3 className='text-lg font-medium'>No leads yet.</h3>
								<p className='mt-2 text-sm text-zinc-400'>Requests submitted through the public website will appear here.</p>
							</div>
						) : <LeadsList leads={leads} />}
					</section>
				</>
			)}
		</main>
	)
}
