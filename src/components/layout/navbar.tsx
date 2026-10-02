import Link from 'next/link'

const navigation = [
	{ label: 'Features', href: '/#features' },
	{ label: 'How it Works', href: '/#how-it-works' },
	{ label: 'Dashboard', href: '/dashboard' },
]

export function Navbar() {
	return (
		<header className='border-b border-zinc-800'>
			<nav
				aria-label='Main navigation'
				className='mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-5 sm:flex-row sm:px-8'
			>
				<Link
					href='/'
					className='flex items-center gap-3 text-lg font-semibold tracking-tight'
				>
					<span
						aria-hidden='true'
						className='flex size-8 items-center justify-center rounded-lg bg-teal-300 text-sm font-bold text-zinc-950'
					>
						LF
					</span>
					LeadFlow AI
				</Link>
				<ul className='flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-400'>
					{navigation.map(item => (
						<li key={item.href}>
							<Link
								href={item.href}
								className='inline-flex min-h-11 items-center hover:text-white'
							>
								{item.label}
							</Link>
						</li>
					))}
				</ul>
			</nav>
		</header>
	)
}
