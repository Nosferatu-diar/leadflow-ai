import 'server-only'
import { createHmac, randomUUID, timingSafeEqual, createHash } from 'node:crypto'
import { compare, truncates } from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthConfig } from './config'

const sessionSeconds = 8 * 60 * 60
const cookieName = process.env.NODE_ENV === 'production' ? '__Host-leadflow-admin' : 'leadflow-admin'
const cookieOptions = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/' }

// Bind sessions to current credentials without putting credentials in the token.
function credentialVersion(config: ReturnType<typeof getAuthConfig>) {
	return createHmac('sha256', config.key).update(`${config.email}\0${config.passwordHash}`).digest('base64url')
}

export async function verifyAdminCredentials(email: string, password: string) {
	const config = getAuthConfig()
	if (truncates(password)) return false
	// Compare the hash even for an incorrect email to avoid an email timing shortcut.
	const passwordMatches = await compare(password, config.passwordHash)
	const suppliedEmail = createHash('sha256').update(email.trim().toLowerCase()).digest()
	const expectedEmail = createHash('sha256').update(config.email).digest()
	return timingSafeEqual(suppliedEmail, expectedEmail) && passwordMatches
}

export async function createAdminSession() {
	const config = getAuthConfig()
	const token = await new SignJWT({ version: credentialVersion(config) })
		.setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
		.setSubject('admin').setIssuer('leadflow-ai').setAudience('leadflow-admin')
		.setJti(randomUUID()).setIssuedAt().setExpirationTime(`${sessionSeconds}s`)
		.sign(config.key)
	;(await cookies()).set(cookieName, token, { ...cookieOptions, maxAge: sessionSeconds })
}

export async function hasAdminSession() {
	const token = (await cookies()).get(cookieName)?.value
	if (!token || token.length > 2048) return false
	try {
		const config = getAuthConfig()
		const { payload } = await jwtVerify(token, config.key, {
			algorithms: ['HS256'], issuer: 'leadflow-ai', audience: 'leadflow-admin',
			requiredClaims: ['sub', 'iat', 'exp', 'jti'], maxTokenAge: `${sessionSeconds}s`,
		})
		return payload.sub === 'admin' && payload.version === credentialVersion(config)
	} catch {
		return false
	}
}

export async function requireAdmin() {
	if (!await hasAdminSession()) redirect('/login')
}

export async function deleteAdminSession() {
	;(await cookies()).set(cookieName, '', { ...cookieOptions, maxAge: 0, expires: new Date(0) })
}
