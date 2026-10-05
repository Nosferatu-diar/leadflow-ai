import { ActionLink } from '@/components/ui/action-link'
import { FeatureCard } from '@/components/ui/feature-card'
import { LeadForm } from '@/components/leads/lead-form'
import { HeroNetwork } from '@/components/home/hero-network'
import { Reveal } from '@/components/home/reveal'
import { ProductIcon } from '@/components/ui/product-icon'
import { Link } from '@/i18n/navigation'

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
	const features = ['collect', 'validation', 'dashboard', 'telegram', 'ai', 'status'] as const
	const audiences = ['agencies', 'restaurants', 'education', 'businesses', 'freelancers', 'teams'] as const
	const steps = [1, 2, 3, 4].map(index => ({ title: t(`step${index}Title`), description: t(`step${index}Description`) }))
	const container = 'mx-auto w-full max-w-6xl px-5 sm:px-8'
	const heading = 'text-3xl font-semibold leading-tight tracking-tight text-balance text-zinc-100 sm:text-[2rem]'
	const label = 'mb-3 text-xs font-medium uppercase tracking-widest text-teal-300'

	return (
		<main id='main-content' className='w-full'>
			<section aria-labelledby='hero-heading' className='homepage-hero relative isolate flex items-center overflow-hidden border-b border-zinc-800'>
				<HeroNetwork />
				<div aria-hidden='true' className='hero-overlay pointer-events-none absolute inset-0' />
				<div className={`${container} relative z-10 py-16`}>
					<h1 id='hero-heading' aria-label={t('headline')} className='max-w-[680px] text-4xl font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]'>
						{[1, 2, 3].map(index => <span key={index} className='lg:block'>{t(`headlineLine${index}`)}{index < 3 ? ' ' : ''}</span>)}
					</h1>
					<p className='mt-6 max-w-[560px] text-base leading-7 text-pretty text-zinc-400 sm:text-lg sm:leading-8'>{t('description')}</p>
					<div className='mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row'>
						<ActionLink href='#lead-form'><span className='inline-flex items-center gap-4'>{t('start')}<ProductIcon kind='arrow' className='size-5' /></span></ActionLink>
						<ActionLink href='/dashboard' variant='secondary'>{t('viewDashboard')}</ActionLink>
					</div>
				</div>
			</section>

			<div className={container}>
				<Reveal>
					<section aria-labelledby='about-heading' className='grid gap-6 py-14 sm:py-16 md:grid-cols-2 md:gap-16'>
						<div><p className={label}>{t('aboutLabel')}</p><h2 id='about-heading' className={`${heading} max-w-md`}>{t('aboutHeading')}</h2></div>
						<p className='self-center text-base leading-8 text-zinc-400 md:border-l md:border-zinc-800 md:pl-12'>{t('aboutDescription')}</p>
					</section>
				</Reveal>
				<Reveal>
					<section id='features' aria-labelledby='features-heading' className='border-t border-zinc-800 py-14 sm:py-20'>
						<div className='mx-auto mb-9 max-w-3xl text-center'>
							<p className={label}>{nav('features')}</p>
							<h2 id='features-heading' className={heading}>{t('featuresHeading')}</h2>
							<p className='mt-4 text-base leading-7 text-zinc-400'>{t('featuresDescription')}</p>
						</div>
						<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
							{features.map(kind => <FeatureCard key={kind} title={t(`${kind}Title`)} description={t(`${kind}Description`)} icon={<ProductIcon kind={kind} />} />)}
						</div>
					</section>
				</Reveal>
				<Reveal>
					<section id='how-it-works' aria-labelledby='how-it-works-heading' className='border-t border-zinc-800 py-14 sm:py-20'>
						<div className='mx-auto max-w-3xl text-center'><p className={label}>{nav('how')}</p><h2 id='how-it-works-heading' className={heading}>{t('stepsHeading')}</h2></div>
						<ol className='relative mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6'>
							{steps.map((step, index) => (
								<li key={step.title} className='relative flex gap-4 sm:block sm:text-center'>
									{index < 3 && <span aria-hidden='true' className='absolute left-[calc(50%+24px)] top-5 hidden h-px w-[calc(100%-24px)] bg-zinc-800 lg:block' />}
									<span aria-hidden='true' className='relative inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-teal-300/35 bg-zinc-950 text-xs font-semibold text-teal-300'>0{index + 1}</span>
									<div className='sm:mt-5'><h3 className='font-semibold leading-6 text-zinc-100'>{step.title}</h3><p className='mt-2 text-sm leading-6 text-zinc-400'>{step.description}</p></div>
								</li>
							))}
						</ol>
					</section>
				</Reveal>
				<Reveal>
					<section aria-labelledby='audience-heading' className='grid gap-9 border-t border-zinc-800 py-14 sm:py-20 lg:grid-cols-[1fr_1.5fr] lg:gap-16'>
						<div><p className={label}>{t('audienceLabel')}</p><h2 id='audience-heading' className={heading}>{t('audienceHeading')}</h2></div>
						<ul className='audience-grid grid grid-cols-2 border-zinc-800 sm:grid-cols-3 lg:border-l'>
							{audiences.map(kind => <li key={kind} className='flex flex-col items-center gap-3 px-3 py-5 text-center text-sm leading-6 text-zinc-200 sm:px-4'><ProductIcon kind={kind} className='size-6 text-zinc-400' /><span>{t(`audience.${kind}`)}</span></li>)}
						</ul>
					</section>
				</Reveal>
				<Reveal>
					<section id='lead-form' aria-labelledby='lead-form-heading' className='grid items-start gap-8 border-t border-zinc-800 py-14 sm:py-20 lg:grid-cols-[1fr_1.65fr] lg:gap-16'>
						<div className='max-w-lg'>
							<p className={label}>{t('start')}</p><h2 id='lead-form-heading' className={heading}>{t('formHeading')}</h2>
							<p className='mt-4 text-base leading-7 text-zinc-400'>{t('formDescription')}</p>
							<Link href='/dashboard' className='mt-5 inline-flex min-h-11 items-center gap-3 rounded-md text-sm font-medium text-teal-300 underline decoration-teal-300/30 underline-offset-4 transition-colors hover:text-teal-200'>{t('viewDashboard')}<ProductIcon kind='arrow' className='size-5' /></Link>
						</div>
						<LeadForm />
					</section>
				</Reveal>
			</div>
		</main>
	)
}
