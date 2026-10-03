import 'server-only'
import { z } from 'zod'

export class AuthConfigurationError extends Error {
	constructor() { super('Admin authentication is not configured.') }
}

export function getAuthConfig() {
	const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
	const passwordHash = process.env.ADMIN_PASSWORD_HASH
	const secret = process.env.AUTH_SECRET
	if (!email || !z.email().safeParse(email).success ||
		!passwordHash || !/^\$2[aby]\$(?:1[0-4])\$[./A-Za-z0-9]{53}$/.test(passwordHash) ||
		!secret || !/^[A-Za-z0-9_-]{43,}$/.test(secret) || Buffer.from(secret, 'base64url').length < 32) {
		throw new AuthConfigurationError()
	}
	return { email, passwordHash, key: Buffer.from(secret, 'base64url') }
}

export function isAuthConfigured() {
	try { getAuthConfig(); return true } catch { return false }
}
