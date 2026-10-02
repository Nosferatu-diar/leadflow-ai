import { leadSchema } from '@/lib/lead-schema'
import { z } from 'zod'

export async function POST(request: Request) {
	let body: unknown

	try {
		body = await request.json()
	} catch {
		return Response.json(
			{ success: false, message: 'Send a valid JSON request.' },
			{ status: 400 },
		)
	}

	const result = leadSchema.safeParse(body)

	if (!result.success) {
		return Response.json(
			{
				success: false,
				message: 'Please check your details and try again.',
				fieldErrors: z.flattenError(result.error).fieldErrors,
			},
			{ status: 400 },
		)
	}

	// Temporary development behavior: validated leads are not persisted.
	console.log('Lead received:', result.data)

	return Response.json({
		success: true,
		message: 'Lead received successfully',
	})
}
