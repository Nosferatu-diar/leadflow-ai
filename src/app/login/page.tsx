import { LoginForm } from '@/components/auth/login-form'
import { isAuthConfigured } from '@/lib/auth/config'
import { hasAdminSession } from '@/lib/auth/session'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Admin Login | LeadFlow AI', robots: { index: false, follow: false } }

export default async function LoginPage() {
	if (await hasAdminSession()) redirect('/dashboard')
	return (
		<main id='main-content' className='mx-auto w-full max-w-md px-6 py-16'>
			<p className='mb-3 text-sm font-medium text-teal-300'>LeadFlow AI</p>
			<h1 className='text-3xl font-semibold'>Admin sign in</h1>
			<p className='mt-3 text-sm text-zinc-400'>Sign in to manage your leads.</p>
			<LoginForm configured={isAuthConfigured()} />
		</main>
	)
}
