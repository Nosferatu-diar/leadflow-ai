import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
	locales: ['en', 'ru', 'uz'],
	defaultLocale: 'en',
	localePrefix: 'always',
	// Bare URLs consistently redirect to English, independent of browser/cookies.
	localeDetection: false,
})

export type Locale = (typeof routing.locales)[number]
