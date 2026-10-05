import { getApiTranslations, getApiLocale } from '@/i18n/api'
import { isSameOriginRequest } from '@/lib/auth/request'
import { deleteAdminSession } from '@/lib/auth/session'

export const runtime = 'nodejs'

export async function POST(request: Request) {
	const t = await getApiTranslations(request)
	if (!isSameOriginRequest(request)) {
		return Response.json({ success: false, message: t('notAllowed') }, { status: 403 })
	}
	try {
		await deleteAdminSession()
	} catch {
		console.error('Unable to complete admin sign-out.')
		return Response.json({ success: false, message: t('logoutFailed') }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
	}
	return new Response(null, { status: 303, headers: { Location: `/${getApiLocale(request)}/login`, 'Cache-Control': 'no-store' } })
}
