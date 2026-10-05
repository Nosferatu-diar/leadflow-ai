type FeatureCardProps = {
	title: string
	description: string
	symbol: string
}

export function FeatureCard({ title, description, symbol }: FeatureCardProps) {
	return (
		<article className='rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-7'>
			<span
				aria-hidden='true'
				className='mb-5 inline-flex size-10 items-center justify-center rounded-lg bg-teal-300/10 text-sm font-medium text-teal-300'
			>
				{symbol}
			</span>
			<h3 className='text-lg font-semibold tracking-tight text-zinc-100'>{title}</h3>
			<p className='mt-3 text-sm leading-6 text-zinc-400'>{description}</p>
		</article>
	)
}
