import { getApiTranslations } from '@/i18n/api'
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
	const t = await getApiTranslations(request)
	if (!isSameOriginRequest(request)) return reply(t('notAllowed'), 403)
	if (!request.headers.get('content-type')?.startsWith('application/json')) return reply(t('json'), 400)
	const rate = consumeRateLimit(`login:${clientBucket(request).key}`, 10, 60_000)
	if (!rate.allowed) return reply(t('loginRate'), 429, rate.retryAfter)
	let body: unknown
	try { body = await readLimitedJson(request, 4 * 1024) } catch (error) {
		return reply(error instanceof RequestTooLargeError ? t('tooLarge') : t('credentials'), error instanceof RequestTooLargeError ? 413 : 400)
	}
	const result = loginSchema.safeParse(body)
	if (!result.success) return reply(t('credentials'), 400)
	try {
		if (!await verifyAdminCredentials(result.data.email, result.data.password)) return reply(t('credentials'), 401)
		await createAdminSession()
	} catch (error) {
		if (error instanceof AuthConfigurationError) return reply(t('authSetup'), 503)
		console.error('Unable to complete admin sign-in.')
		return reply(t('loginFailed'), 503)
	}
	return Response.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
}
