import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
	// APIs, framework assets and file URLs remain unprefixed.
	matcher: '/((?!api(?:/|$)|_next|_vercel|.*\\..*).*)',
}
