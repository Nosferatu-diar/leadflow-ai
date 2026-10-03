import { isSameOriginRequest } from '@/lib/auth/request'
import { deleteAdminSession } from '@/lib/auth/session'

export const runtime = 'nodejs'

export async function POST(request: Request) {
	if (!isSameOriginRequest(request)) {
		return Response.json({ success: false, message: 'Request not allowed.' }, { status: 403 })
	}
	await deleteAdminSession()
	return new Response(null, { status: 303, headers: { Location: '/login', 'Cache-Control': 'no-store' } })
}
