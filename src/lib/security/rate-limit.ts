import 'server-only'
import { createHmac, randomBytes } from 'node:crypto'
import { isIP } from 'node:net'

type Bucket = { count: number; expiresAt: number }
const globalLimits = globalThis as typeof globalThis & {
	leadFlowLimits?: { buckets: Map<string, Bucket>; salt: Buffer; cleanupAt: number }
}
const state = globalLimits.leadFlowLimits ??= { buckets: new Map(), salt: randomBytes(32), cleanupAt: 0 }

export function clientBucket(request: Request) {
	const header = process.env.TRUST_PROXY_IP_HEADER?.trim().toLowerCase()
	// Only opt in when a trusted, unavoidable proxy overwrites this header.
	if (header === 'x-real-ip' || header === 'x-forwarded-for') {
		const value = request.headers.get(header)?.trim()
		// Refuse ambiguous chains; no guessing which proxy is trusted.
		if (value && value.length <= 45 && isIP(value)) {
			try {
				const normalized = isIP(value) === 6 ? new URL(`http://[${value}]/`).hostname : value
				return { key: createHmac('sha256', state.salt).update(normalized).digest('hex'), identified: true }
			} catch { /* Unsupported scoped IPv6 values use the safe fallback. */ }
		}
	}
	return { key: 'shared-fallback', identified: false }
}

export function consumeRateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
	if (now >= state.cleanupAt) {
		for (const [storedKey, stored] of state.buckets) if (stored.expiresAt <= now) state.buckets.delete(storedKey)
		state.cleanupAt = now + 60_000
	}
	let bucket = state.buckets.get(key)
	if (!bucket || bucket.expiresAt <= now) {
		// Expired entries are removed; a changing IP cannot grow memory unbounded.
		if (state.buckets.size >= 10_000 && !state.buckets.has(key)) {
			return { allowed: false, retryAfter: Math.max(1, Math.ceil(windowMs / 1000)) }
		}
		bucket = { count: 0, expiresAt: now + windowMs }
		state.buckets.set(key, bucket)
	}
	if (bucket.count >= limit) return { allowed: false, retryAfter: Math.max(1, Math.ceil((bucket.expiresAt - now) / 1000)) }
	bucket.count += 1
	return { allowed: true, retryAfter: 0 }
}
