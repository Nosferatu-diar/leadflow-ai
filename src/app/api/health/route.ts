export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Liveness only: no credentials, provider calls, or database dependency.
export function GET() {
	return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
}
