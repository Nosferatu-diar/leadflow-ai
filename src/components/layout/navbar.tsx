import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from './language-switcher'

const navigation = [
	{ label: 'features', href: '/#features' },
	{ label: 'how', href: '/#how-it-works' },
	{ label: 'dashboard', href: '/dashboard' },
]

export function Navbar() {
	const t = useTranslations('Nav')
	return (
		<header className='border-b border-zinc-800 bg-zinc-950'>
			<nav
				aria-label={t('label')}
				className='mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-5 py-4 sm:px-8 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-x-8'
			>
				<Link
					href='/'
					className='inline-flex min-h-11 w-fit items-center gap-2.5 text-base font-semibold tracking-tight sm:text-lg'
				>
					<span
						aria-hidden='true'
						className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-300 text-sm font-bold text-zinc-950'
					>
						LF
					</span>
					LeadFlow AI
				</Link>
				<ul className='col-span-2 row-start-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-zinc-400 sm:gap-x-5 sm:text-sm lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:justify-end'>
					{navigation.map(item => (
						<li key={item.href}>
							<Link
								href={item.href}
								className='inline-flex min-h-11 items-center rounded-md transition-colors hover:text-white'
							>
								{t(item.label)}
							</Link>
						</li>
					))}
				</ul>
				<div className='col-start-2 row-start-1 lg:col-start-3'><LanguageSwitcher /></div>
			</nav>
		</header>
	)
}
