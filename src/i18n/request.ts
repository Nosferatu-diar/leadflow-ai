import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { locale as rootLocale } from 'next/root-params'
import { notFound } from 'next/navigation'
import { routing } from './routing'

export default getRequestConfig(async ({ locale: explicitLocale }) => {
	// API handlers supply an explicit locale; only pages read root parameters.
	const locale = explicitLocale ?? await rootLocale()
	if (!hasLocale(routing.locales, locale)) notFound()
	return {
		locale,
		timeZone: 'UTC',
		messages: (await import(`../../messages/${locale}.json`)).default,
	}
})
