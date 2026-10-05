import { getApiTranslations } from '@/i18n/api'
import 'server-only'
import { hasAdminSession } from './session'
import { hasAllowedOrigin } from '@/lib/security/request-origin'

export function isSameOriginRequest(request: Request) {
	return hasAllowedOrigin(request, true)
}

export async function authorizeAdminMutation(request: Request) {
	const t = await getApiTranslations(request)
	if (!await hasAdminSession()) {
		return Response.json({ success: false, message: t('signIn') }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
	}
	if (!isSameOriginRequest(request)) {
		return Response.json({ success: false, message: t('notAllowed') }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
	}
	return null
}
