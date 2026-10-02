import { ActionLink } from '@/components/ui/action-link'
import { FeatureCard } from '@/components/ui/feature-card'

const features = [
	{
		title: 'Collect Leads',
		description: 'Capture customer requests from your website.',
		symbol: '01',
	},
	{
		title: 'AI Analysis',
		description: 'Analyze and organize incoming leads using AI.',
		symbol: '02',
	},
	{
		title: 'Instant Notifications',
		description: 'Receive important lead notifications instantly.',
		symbol: '03',
	},
]

const steps = [
	{
		title: 'Capture a request',
		description:
			'Give potential customers a simple way to reach your business.',
	},
	{
		title: 'Understand the opportunity',
		description:
			'Bring incoming leads together and discover what customers need.',
	},
	{
		title: 'Take the next step',
		description: 'Stay informed so you can follow up with confidence.',
	},
]

export default function Home() {
	return (
		<main id='main-content' className='mx-auto w-full max-w-6xl px-6 sm:px-8'>
			<section
				aria-labelledby='hero-heading'
				className='py-20 text-center sm:py-28'
			>
				<p className='mb-6 text-sm font-medium tracking-widest text-teal-300'>
					LeadFlow AI
				</p>
				<h1
					id='hero-heading'
					className='mx-auto max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl'
				>
					Turn incoming leads into opportunities with AI.
				</h1>
				<p className='mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-400'>
					LeadFlow AI helps businesses collect, organize and analyze customer
					leads.
				</p>
				<div className='mt-9 flex flex-col justify-center gap-3 sm:flex-row'>
					<ActionLink href='#how-it-works'>Get Started</ActionLink>
					<ActionLink href='#dashboard' variant='secondary'>
						View Dashboard
					</ActionLink>
				</div>
			</section>

			<section
				id='features'
				aria-labelledby='features-heading'
				className='scroll-mt-8 pb-20'
			>
				<div className='mb-8'>
					<p className='mb-3 text-xs font-medium uppercase tracking-widest text-teal-300'>
						Features
					</p>
					<h2
						id='features-heading'
						className='text-2xl font-semibold tracking-tight sm:text-3xl'
					>
						A clearer path from interest to opportunity.
					</h2>
				</div>
				<div className='grid gap-4 md:grid-cols-3'>
					{features.map(feature => (
						<FeatureCard key={feature.title} {...feature} />
					))}
				</div>
			</section>

			<section
				id='how-it-works'
				aria-labelledby='how-it-works-heading'
				className='scroll-mt-8 border-t border-zinc-800 py-16'
			>
				<p className='mb-3 text-xs font-medium uppercase tracking-widest text-teal-300'>
					How it Works
				</p>
				<h2
					id='how-it-works-heading'
					className='text-2xl font-semibold tracking-tight sm:text-3xl'
				>
					Three steps. One organized workflow.
				</h2>
				<ol className='mt-9 grid gap-8 md:grid-cols-3'>
					{steps.map((step, index) => (
						<li key={step.title}>
							<span
								className='text-sm font-medium text-teal-300'
								aria-hidden='true'
							>
								0{index + 1}
							</span>
							<h3 className='mt-3 font-medium text-zinc-100'>{step.title}</h3>
							<p className='mt-2 text-sm leading-6 text-zinc-400'>
								{step.description}
							</p>
						</li>
					))}
				</ol>
			</section>

			<section
				id='dashboard'
				aria-labelledby='dashboard-heading'
				className='mb-16 scroll-mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 sm:flex sm:items-center sm:justify-between sm:gap-8'
			>
				<div>
					<h2 id='dashboard-heading' className='text-xl font-semibold'>
						Your leads, in one place.
					</h2>
					<p className='mt-2 max-w-xl text-sm leading-6 text-zinc-400'>
						The LeadFlow AI dashboard is coming soon. This is the first step
						toward a simpler way to manage your leads.
					</p>
				</div>
				<span className='mt-5 inline-flex shrink-0 rounded-full border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300 sm:mt-0'>
					Coming soon
				</span>
			</section>
		</main>
	)
}
