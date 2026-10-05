import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { LanguageSwitcher } from './language-switcher'

export async function Footer() {
	const [t, nav, home] = await Promise.all([
		getTranslations('Footer'), getTranslations('Nav'), getTranslations('Home'),
	])
	const links = [
		{ href: '/#features', label: nav('features') },
		{ href: '/#how-it-works', label: nav('how') },
		{ href: '/#lead-form', label: home('start') },
		{ href: '/dashboard', label: nav('dashboard') },
	]
	return (
		<footer className='mt-auto border-t border-zinc-800'>
			<div className='mx-auto max-w-6xl px-5 pt-12 sm:px-8 sm:pt-16'>
				<div className='grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-[2fr_1.2fr_0.8fr_1.2fr] lg:gap-12'>
					<div className='col-span-2 lg:col-span-1'>
						<Link href='/' className='inline-flex min-h-11 items-center gap-2.5 text-lg font-semibold tracking-tight'>
							<span aria-hidden='true' className='flex size-8 items-center justify-center rounded-lg bg-teal-300 text-sm font-bold text-zinc-950'>LF</span>
							LeadFlow AI
						</Link>
						<p className='mt-4 max-w-xs text-sm leading-6 text-zinc-400'>{t('description')}</p>
						<p className='mt-4 text-xs leading-5 text-teal-300'>{t('demo')}</p>
					</div>
					<div>
						<h2 className='mb-2 text-sm font-semibold text-zinc-100'>{t('product')}</h2>
						<ul className='text-sm text-zinc-400'>
							{links.map(link => <li key={link.href}><Link href={link.href} className='inline-flex min-h-11 items-center rounded-md transition-colors hover:text-white'>{link.label}</Link></li>)}
						</ul>
					</div>
					<div>
						<h2 className='mb-2 text-sm font-semibold text-zinc-100'>{t('languages')}</h2>
						<LanguageSwitcher variant='footer' />
					</div>
					<div className='col-span-2 lg:col-span-1'>
						<h2 className='mb-4 text-sm font-semibold text-zinc-100'>{t('technology')}</h2>
						<ul className='space-y-3 text-sm text-zinc-400'>
							{['Next.js', 'PostgreSQL', 'Prisma', 'Telegram', t('aiIntegration')].map(label => <li key={label}>{label}</li>)}
						</ul>
					</div>
				</div>
				<div className='mt-12 flex flex-col gap-3 border-t border-zinc-800 py-6 text-xs leading-5 text-zinc-400 sm:flex-row sm:items-center sm:justify-between'>
					<p>LeadFlow AI © 2026</p>
					<p>{t('note')}</p>
				</div>
			</div>
		</footer>
	)
}
