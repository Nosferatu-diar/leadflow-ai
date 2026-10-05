import { getTranslations } from 'next-intl/server'
import { LogoutControl } from '@/components/auth/logout-control'
import { LeadsList } from '@/components/leads/leads-list'
import { LeadDeletionFeedbackProvider } from '@/components/leads/delete-lead-control'
import { ActionLink } from '@/components/ui/action-link'
import { prisma } from '@/lib/prisma'
import type { Lead } from '@prisma/client'
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { leadStatuses } from '@/lib/lead-status'
import { requireAdmin } from '@/lib/auth/session'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('Metadata')
	return { title: t('dashboard'), robots: { index: false, follow: false } }
}

export default async function DashboardPage() {
	await requireAdmin()
	const [t, statuses] = await Promise.all([getTranslations('Dashboard'), getTranslations('Statuses')])
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
		{ label: t('total'), value: leads?.length ?? 0 },
		{ label: t('website'), value: serviceCounts.Website },
		{ label: t('webApp'), value: serviceCounts.WebApplication },
		{ label: t('ai'), value: serviceCounts.AIAutomation },
	]

	return (
		<main id='main-content' className='mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-12'>
			<header className='mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between'>
				<div>
					<p className='mb-3 text-xs font-semibold uppercase tracking-widest text-teal-300'>LeadFlow AI</p>
					<h1 className='text-3xl font-semibold tracking-tight text-balance sm:text-4xl'>{t('title')}</h1>
					<p className='mt-3 text-sm text-zinc-400'>
						{leads === null ? t('countUnavailable') : t('count', { count: leads.length })}
					</p>
				</div>
				<div className='flex flex-wrap items-center gap-3'>
					<ActionLink href='/' variant='secondary'>{t('back')}</ActionLink>
					<LogoutControl />
				</div>
			</header>

			{leads === null ? (
				<section aria-labelledby='dashboard-error-heading' className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8'>
					<h2 id='dashboard-error-heading' className='text-xl font-semibold'>{t('unavailable')}</h2>
					<p className='mt-3 text-sm leading-6 text-zinc-400'>{t('unavailableHint')}</p>
				</section>
			) : (
				<>
					<dl aria-label={t('stats')} className='mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4'>
						{stats.map(stat => (
							<div key={stat.label} className='flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-6'>
								<dt className='min-h-10 text-sm leading-5 text-zinc-400'>{stat.label}</dt>
								<dd className='mt-auto pt-3 text-3xl font-semibold tracking-tight text-teal-200 tabular-nums'>{stat.value}</dd>
							</div>
						))}
					</dl>
					<dl aria-label={t('statusOverview')} className='mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
						{leadStatuses.map(status => (
							<div key={status} className='rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4'>
								<dt className='min-h-10 text-sm leading-5 text-zinc-400'>{statuses(status)}</dt>
								<dd className='mt-2 text-2xl font-semibold tabular-nums'>{statusCounts[status]}</dd>
							</div>
						))}
					</dl>
					<section aria-labelledby='all-leads-heading'>
						<div className='mb-5 flex flex-wrap items-baseline justify-between gap-2'>
							<h2 id='all-leads-heading' className='text-xl font-semibold'>{t('all')}</h2>
							<p className='text-xs text-zinc-400'>{t('utc')}</p>
						</div>
						<LeadDeletionFeedbackProvider>
							{leads.length === 0 ? (
								<div className='rounded-2xl border border-dashed border-zinc-700 p-10 text-center'>
									<h3 className='text-lg font-medium'>{t('empty')}</h3>
										<p className='mt-2 text-sm text-zinc-400'>{t('emptyHint')}</p>
								</div>
							) : <LeadsList leads={leads} />}
						</LeadDeletionFeedbackProvider>
					</section>
				</>
			)}
		</main>
	)
}
