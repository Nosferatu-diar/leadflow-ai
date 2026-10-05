'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

export function LanguageSwitcher() {
	const locale = useLocale()
	const pathname = usePathname()
	const t = useTranslations('Common')
	return (
		<nav aria-label={t('language')} className='flex shrink-0 gap-0.5 rounded-lg border border-zinc-800 bg-zinc-900/60 p-0.5 text-xs font-semibold'>
			{routing.locales.map(value => (
				<a key={value} href={`/${value}${pathname === '/' ? '' : pathname}`} hrefLang={value} lang={value} aria-current={locale === value ? 'page' : undefined}
					className='inline-flex min-h-11 min-w-11 items-center justify-center rounded-md transition-colors hover:bg-zinc-800 hover:text-white aria-[current=page]:bg-teal-300/10 aria-[current=page]:text-teal-300'
					onClick={event => {
						// Read query/hash at click time without opting static pages into useSearchParams.
						const anchor = event.currentTarget
						anchor.href = `/${value}${pathname === '/' ? '' : pathname}${window.location.search}${window.location.hash}`
					}}>
					{value.toUpperCase()}
				</a>
			))}
		</nav>
	)
}
