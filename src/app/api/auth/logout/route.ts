import { isSameOriginRequest } from '@/lib/auth/request'
import { deleteAdminSession } from '@/lib/auth/session'

export const runtime = 'nodejs'

export async function POST(request: Request) {
	if (!isSameOriginRequest(request)) {
		return Response.json({ success: false, message: 'Request not allowed.' }, { status: 403 })
	}
	try {
		await deleteAdminSession()
	} catch {
		console.error('Unable to complete admin sign-out.')
		return Response.json({ success: false, message: 'Unable to sign out. Please try again.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
	}
	return new Response(null, { status: 303, headers: { Location: '/login', 'Cache-Control': 'no-store' } })
}
