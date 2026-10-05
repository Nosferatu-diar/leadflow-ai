import 'server-only'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { routing } from './routing'

// Locale selects response wording only; it never changes authorization or data.
export function getApiLocale(request: Request) {
	const value = request.headers.get('x-leadflow-locale') ?? new URL(request.url).searchParams.get('locale')
	return hasLocale(routing.locales, value) ? value : routing.defaultLocale
}

export function getApiTranslations(request: Request) {
	return getTranslations({ locale: getApiLocale(request), namespace: 'Api' })
}
