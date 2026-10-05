import { LoginForm } from '@/components/auth/login-form'
import { isAuthConfigured } from '@/lib/auth/config'
import { hasAdminSession } from '@/lib/auth/session'
import type { Metadata } from 'next'
import { redirect } from '@/i18n/navigation'
import { getLocale, getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('Metadata')
	return { title: t('login'), robots: { index: false, follow: false } }
}

export default async function LoginPage() {
	const locale = await getLocale()
	if (await hasAdminSession()) redirect({ href: '/dashboard', locale })
	const t = await getTranslations('Auth')
	return (
		<main id='main-content' className='mx-auto flex w-full max-w-lg flex-1 items-center px-5 py-12 sm:px-8 sm:py-20'>
			<section className='w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl shadow-black/10 sm:p-8' aria-labelledby='login-heading'>
				<p className='mb-4 text-xs font-semibold uppercase tracking-widest text-teal-300'>LeadFlow AI</p>
				<h1 id='login-heading' className='text-2xl font-semibold tracking-tight sm:text-3xl'>{t('title')}</h1>
				<p className='mt-3 text-sm leading-6 text-zinc-400'>{t('description')}</p>
				<LoginForm configured={isAuthConfigured()} />
			</section>
		</main>
	)
}
