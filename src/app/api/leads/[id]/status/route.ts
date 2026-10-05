import { getApiTranslations } from '@/i18n/api'
import { leadIdSchema, statusUpdateSchema } from '@/lib/lead-status'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { authorizeAdminMutation } from '@/lib/auth/request'
import { readLimitedJson, RequestTooLargeError } from '@/lib/security/read-json'

export const runtime = 'nodejs'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const t = await getApiTranslations(request)
	const denied = await authorizeAdminMutation(request)
	if (denied) return denied
	const { id } = await params
	if (!leadIdSchema.safeParse(id).success) {
		return Response.json({ success: false, message: t('invalidId') }, { status: 400 })
	}

	let body: unknown
	try {
		body = await readLimitedJson(request, 1024)
	} catch (error) {
		if (error instanceof RequestTooLargeError) return Response.json({ success: false, message: t('tooLarge') }, { status: 413 })
		return Response.json({ success: false, message: t('json') }, { status: 400 })
	}
	const result = statusUpdateSchema.safeParse(body)
	if (!result.success) {
		return Response.json({ success: false, message: t('status') }, { status: 400 })
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
			return Response.json({ success: false, message: t('notFound') }, { status: 404 })
		}
		console.error('Unable to update lead status.')
		return Response.json({ success: false, message: t('statusFailed') }, { status: 503 })
	}

	revalidatePath('/[locale]/dashboard', 'page')
	return Response.json({ success: true, lead })
}
