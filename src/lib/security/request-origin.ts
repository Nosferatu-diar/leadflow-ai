import 'server-only'

// Public requests may omit Origin; admin requests must supply it.
export function hasAllowedOrigin(request: Request, requireOrigin = false) {
	if (request.headers.get('sec-fetch-site') === 'cross-site') return false
	const origin = request.headers.get('origin')
	if (!origin) return !requireOrigin
	try {
		const parsed = new URL(origin)
		return origin === parsed.origin && parsed.origin === new URL(request.url).origin
	} catch { return false }
}
