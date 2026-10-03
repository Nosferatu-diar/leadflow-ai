import 'server-only'
import { hasAdminSession } from './session'
import { hasAllowedOrigin } from '@/lib/security/request-origin'

export function isSameOriginRequest(request: Request) {
	return hasAllowedOrigin(request, true)
}

export async function authorizeAdminMutation(request: Request) {
	if (!await hasAdminSession()) {
		return Response.json({ success: false, message: 'Please sign in to continue.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
	}
	if (!isSameOriginRequest(request)) {
		return Response.json({ success: false, message: 'Request not allowed.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
	}
	return null
}
