type FeatureCardProps = {
	title: string
	description: string
	icon: React.ReactNode
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
	return (
		<article className='flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-teal-300/30 sm:p-7'>
			<span
				aria-hidden='true'
				className='mt-0.5 inline-flex size-6 shrink-0 items-center justify-center text-teal-300'
			>
				{icon}
			</span>
			<div>
				<h3 className='text-base font-semibold tracking-tight text-zinc-100'>{title}</h3>
				<p className='mt-2 text-sm leading-6 text-zinc-400'>{description}</p>
			</div>
		</article>
	)
}
