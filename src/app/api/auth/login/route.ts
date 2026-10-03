import { AuthConfigurationError } from '@/lib/auth/config'
import { isSameOriginRequest } from '@/lib/auth/request'
import { createAdminSession, verifyAdminCredentials } from '@/lib/auth/session'
import { z } from 'zod'
import { readLimitedJson, RequestTooLargeError } from '@/lib/security/read-json'
import { clientBucket, consumeRateLimit } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'
const loginSchema = z.object({ email: z.string().trim().max(254), password: z.string().min(1).max(72) }).strict()

function reply(message: string, status: number, retryAfter?: number) {
	return Response.json({ success: false, message }, { status, headers: { 'Cache-Control': 'no-store', ...(retryAfter ? { 'Retry-After': String(retryAfter) } : {}) } })
}

export async function POST(request: Request) {
	if (!isSameOriginRequest(request)) return reply('Request not allowed.', 403)
	if (!request.headers.get('content-type')?.startsWith('application/json')) return reply('Send a valid JSON request.', 400)
	const rate = consumeRateLimit(`login:${clientBucket(request).key}`, 10, 60_000)
	if (!rate.allowed) return reply('Too many sign-in attempts. Please try again in a minute.', 429, rate.retryAfter)
	let body: unknown
	try { body = await readLimitedJson(request, 4 * 1024) } catch (error) {
		return reply(error instanceof RequestTooLargeError ? 'Request is too large.' : 'Invalid email or password.', error instanceof RequestTooLargeError ? 413 : 400)
	}
	const result = loginSchema.safeParse(body)
	if (!result.success) return reply('Invalid email or password.', 400)
	try {
		if (!await verifyAdminCredentials(result.data.email, result.data.password)) return reply('Invalid email or password.', 401)
		await createAdminSession()
	} catch (error) {
		if (error instanceof AuthConfigurationError) return reply('Admin sign-in is not configured. Contact the site owner.', 503)
		console.error('Unable to complete admin sign-in.')
		return reply('Unable to sign in. Please try again later.', 503)
	}
	return Response.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
}
