import { useTranslations } from 'next-intl'

export default function DashboardLoading() {
	const t = useTranslations('Dashboard')
	return (
		<main id='main-content' className='mx-auto w-full max-w-6xl px-6 py-16 sm:px-8'>
			<p role='status' className='text-sm text-zinc-400'>{t('loading')}</p>
		</main>
	)
}
