import { leadIdSchema, statusUpdateSchema } from '@/lib/lead-status'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { authorizeAdminMutation } from '@/lib/auth/request'

export const runtime = 'nodejs'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const denied = await authorizeAdminMutation(request)
	if (denied) return denied
	const { id } = await params
	if (!leadIdSchema.safeParse(id).success) {
		return Response.json({ success: false, message: 'Invalid lead ID.' }, { status: 400 })
	}

	let body: unknown
	try {
		body = await request.json()
	} catch {
		return Response.json({ success: false, message: 'Send a valid JSON request.' }, { status: 400 })
	}
	const result = statusUpdateSchema.safeParse(body)
	if (!result.success) {
		return Response.json({ success: false, message: 'Choose a valid lead status.' }, { status: 400 })
	}

	let lead
	try {
		lead = await prisma.lead.update({
			where: { id },
			data: { status: result.data.status },
			select: { id: true, status: true },
		})
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
			return Response.json({ success: false, message: 'Lead not found.' }, { status: 404 })
		}
		console.error('Unable to update lead status.')
		return Response.json({ success: false, message: 'Unable to update the status. Please try again later.' }, { status: 503 })
	}

	revalidatePath('/dashboard')
	return Response.json({ success: true, lead })
}
