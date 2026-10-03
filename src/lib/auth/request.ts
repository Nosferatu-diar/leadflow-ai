import 'server-only'
import { hasAdminSession } from './session'

export function isSameOriginRequest(request: Request) {
	const origin = request.headers.get('origin')
	if (!origin || request.headers.get('sec-fetch-site') === 'cross-site') return false
	try { return new URL(origin).origin === new URL(request.url).origin } catch { return false }
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
