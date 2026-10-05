import { getApiTranslations } from '@/i18n/api'
import { authorizeAdminMutation } from '@/lib/auth/request'
import { leadIdSchema } from '@/lib/lead-status'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const denied = await authorizeAdminMutation(request)
	if (denied) return denied
	const t = await getApiTranslations(request)
	const { id } = await params
	if (!leadIdSchema.safeParse(id).success) {
		return Response.json({ success: false, message: t('invalidId') }, { status: 400 })
	}

	try {
		// A single delete avoids a race between an existence check and deletion.
		await prisma.lead.delete({ where: { id }, select: { id: true } })
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
			return Response.json({ success: false, message: t('notFound') }, { status: 404 })
		}
		console.error('Unable to delete lead.')
		return Response.json({ success: false, message: t('deleteFailed') }, { status: 503 })
	}

	revalidatePath('/[locale]/dashboard', 'page')
	return Response.json({ success: true, message: t('deleted') })
}
