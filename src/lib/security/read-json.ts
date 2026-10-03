import 'server-only'

export class RequestTooLargeError extends Error {}

// Enforce bytes actually read, including requests without Content-Length.
export async function readLimitedJson(request: Request, maxBytes: number): Promise<unknown> {
	const length = request.headers.get('content-length')
	if (length && /^\d+$/.test(length) && Number(length) > maxBytes) {
		await request.body?.cancel().catch(() => {})
		throw new RequestTooLargeError()
	}
	if (!request.body) throw new SyntaxError('Missing JSON body.')
	const reader = request.body.getReader()
	const chunks: Uint8Array[] = []
	let bytes = 0
	try {
		while (true) {
			const { done, value } = await reader.read()
			if (done) break
			bytes += value.byteLength
			if (bytes > maxBytes) {
				await reader.cancel().catch(() => {})
				throw new RequestTooLargeError()
			}
			chunks.push(value)
		}
	} finally {
		reader.releaseLock()
	}
	const body = new Uint8Array(bytes)
	let offset = 0
	for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength }
	return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(body))
}
