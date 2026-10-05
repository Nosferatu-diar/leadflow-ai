import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Navbar } from '@/components/layout/navbar'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '../globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const { locale } = await params
	if (!hasLocale(routing.locales, locale)) notFound()
	const t = await getTranslations({ locale, namespace: 'Metadata' })
	return { title: 'LeadFlow AI', description: t('description') }
}

export function generateStaticParams() {
	return routing.locales.map(locale => ({ locale }))
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
	const { locale } = await params
	if (!hasLocale(routing.locales, locale)) notFound()
	const [messages, t] = await Promise.all([getMessages(), getTranslations('Common')])
	// Only interactive components' namespaces are serialized to the browser.
	const clientMessages = Object.fromEntries(
		['Common', 'Form', 'Fields', 'Services', 'ContactMethods', 'Validation', 'Auth', 'AI', 'Status', 'Statuses', 'DeleteLead']
			.map(key => [key, messages[key]]),
	)

	return (
		<html
			lang={locale}
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className='min-h-full flex flex-col font-sans'>
				<a
					href='#main-content'
					className='sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-lg focus:bg-teal-300 focus:px-4 focus:py-3 focus:text-zinc-950'
				>
					{t('skip')}
				</a>
				<NextIntlClientProvider locale={locale} messages={clientMessages} timeZone='UTC'>
				<Navbar />
				{children}
				</NextIntlClientProvider>
				<footer className='mt-auto border-t border-zinc-800 px-6 py-6 text-center text-xs text-zinc-500'>
					LeadFlow AI · {t('footer')}
				</footer>
			</body>
		</html>
	)
}
