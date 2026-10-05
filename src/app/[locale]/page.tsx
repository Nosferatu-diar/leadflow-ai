import { ActionLink } from '@/components/ui/action-link'
import { FeatureCard } from '@/components/ui/feature-card'
import { LeadForm } from '@/components/leads/lead-form'

import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'Metadata' })
	const metadata: Metadata = { title: 'LeadFlow AI', description: t('description') }
	// Do not invent a deployed origin for canonical/hreflang URLs.
	const origin = process.env.APP_ORIGIN?.trim()
	if (origin) {
		try {
			const url = new URL(origin)
			if (origin === url.origin && ['https:', 'http:'].includes(url.protocol)) {
				metadata.alternates = {
					canonical: `${origin}/${locale}`,
					languages: { en: `${origin}/en`, ru: `${origin}/ru`, uz: `${origin}/uz`, 'x-default': `${origin}/en` },
				}
			}
		} catch { /* Omit alternates until a real public origin is configured. */ }
	}
	return metadata
}

export default async function Home() {
	const [t, nav] = await Promise.all([getTranslations('Home'), getTranslations('Nav')])
	const features = ['collect', 'ai', 'notify'].map((key, index) => ({ title: t(`${key}Title`), description: t(`${key}Description`), symbol: `0${index + 1}` }))
	const steps = [1, 2, 3].map(index => ({ title: t(`step${index}Title`), description: t(`step${index}Description`) }))

	return (
		<main id='main-content' className='mx-auto w-full max-w-6xl px-5 sm:px-8'>
			<section
				aria-labelledby='hero-heading'
				className='py-16 text-center sm:py-24 lg:py-28'
			>
				<p className='mb-5 text-xs font-semibold uppercase tracking-widest text-teal-300'>
					LeadFlow AI
				</p>
				<h1
					id='hero-heading'
					className='mx-auto max-w-4xl text-4xl font-semibold leading-[1.12] tracking-tight text-balance text-white sm:text-5xl lg:text-6xl'
				>
					{t('headline')}
				</h1>
				<p className='mx-auto mt-6 max-w-2xl text-base leading-7 text-pretty sm:text-lg sm:leading-8 text-zinc-400'>
					{t('description')}
				</p>
				<div className='mx-auto mt-8 flex max-w-sm flex-col justify-center gap-3 sm:mt-9 sm:max-w-none sm:flex-row'>
					<ActionLink href='#lead-form'>{t('start')}</ActionLink>
					<ActionLink href='/dashboard' variant='secondary'>
						{t('viewDashboard')}
					</ActionLink>
				</div>
			</section>

			<section
				id='features'
				aria-labelledby='features-heading'
				className='scroll-mt-8 pb-16 sm:pb-20'
			>
				<div className='mb-8'>
					<p className='mb-3 text-xs font-medium uppercase tracking-widest text-teal-300'>
						{nav('features')}
					</p>
					<h2
						id='features-heading'
						className='text-2xl font-semibold tracking-tight sm:text-3xl'
					>
						{t('featuresHeading')}
					</h2>
				</div>
				<div className='grid gap-4 md:grid-cols-3'>
					{features.map(feature => (
						<FeatureCard key={feature.title} {...feature} />
					))}
				</div>
			</section>

			<section
				id='how-it-works'
				aria-labelledby='how-it-works-heading'
				className='scroll-mt-8 border-t border-zinc-800 py-14 sm:py-20'
			>
				<p className='mb-3 text-xs font-medium uppercase tracking-widest text-teal-300'>
					{nav('how')}
				</p>
				<h2
					id='how-it-works-heading'
					className='text-2xl font-semibold tracking-tight sm:text-3xl'
				>
					{t('stepsHeading')}
				</h2>
				<ol className='mt-8 grid gap-6 md:grid-cols-3 md:gap-8'>
					{steps.map((step, index) => (
						<li key={step.title} className='rounded-xl border border-zinc-800/80 p-5 sm:p-6'>
							<span
								className='inline-flex size-9 items-center justify-center rounded-full border border-teal-300/25 text-xs font-semibold text-teal-300'
								aria-hidden='true'
							>
								0{index + 1}
							</span>
							<h3 className='mt-3 font-medium text-zinc-100'>{step.title}</h3>
							<p className='mt-2 text-sm leading-6 text-zinc-400'>
								{step.description}
							</p>
						</li>
					))}
				</ol>
			</section>

			<section
				id='lead-form'
				aria-labelledby='lead-form-heading'
				className='scroll-mt-8 border-t border-zinc-800 py-14 sm:py-20'
			>
				<p className='mb-3 text-xs font-medium uppercase tracking-widest text-teal-300'>{t('start')}</p>
				<h2 id='lead-form-heading' className='text-2xl font-semibold tracking-tight sm:text-3xl'>{t('formHeading')}</h2>
				<p className='mt-3 text-sm leading-6 text-zinc-400'>{t('formDescription')}</p>
				<LeadForm />
			</section>

			<section
				id='dashboard'
				aria-labelledby='dashboard-heading'
				className='mb-16 scroll-mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 lg:flex lg:items-center lg:justify-between lg:gap-8 sm:p-8'
			>
				<div>
					<h2 id='dashboard-heading' className='text-xl font-semibold'>
						{t('dashboardHeading')}
					</h2>
					<p className='mt-2 max-w-xl text-sm leading-6 text-zinc-400'>
						{t('dashboardDescription')}
					</p>
				</div>
				<div className='mt-5 shrink-0 lg:mt-0'>
					<ActionLink href='/dashboard' variant='secondary'>{t('viewDashboard')}</ActionLink>
				</div>
			</section>
		</main>
	)
}
