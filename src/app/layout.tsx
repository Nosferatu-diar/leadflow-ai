import { Navbar } from '@/components/layout/navbar'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'LeadFlow AI',
	description: 'AI-powered lead management platform',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
	return (
		<html
			lang='en'
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className='min-h-full flex flex-col font-sans'>
				<a
					href='#main-content'
					className='sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-lg focus:bg-teal-300 focus:px-4 focus:py-3 focus:text-zinc-950'
				>
					Skip to content
				</a>
				<Navbar />
				{children}
				<footer className='mt-auto border-t border-zinc-800 px-6 py-6 text-center text-xs text-zinc-500'>
					LeadFlow AI · A little more clarity. A lot more opportunity.
				</footer>
			</body>
		</html>
	)
}
