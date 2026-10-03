import 'server-only'

// Public requests may omit Origin; admin requests must supply it.
export function hasAllowedOrigin(request: Request, requireOrigin = false) {
	if (request.headers.get('sec-fetch-site') === 'cross-site') return false
	const origin = request.headers.get('origin')
	if (!origin) return !requireOrigin
	try {
		const parsed = new URL(origin)
		// A fixed public origin avoids comparing HTTPS visitors to a proxy's
		// internal listening address. Never derive this allowlist from headers.
		const configuredOrigin = process.env.APP_ORIGIN?.trim()
		const expected = new URL(configuredOrigin || request.url)
		if (configuredOrigin && (
			configuredOrigin !== expected.origin ||
			!['http:', 'https:'].includes(expected.protocol) ||
			(process.env.NODE_ENV === 'production' && expected.protocol !== 'https:')
		)) return false
		return origin === parsed.origin && parsed.origin === expected.origin
	} catch { return false }
}
