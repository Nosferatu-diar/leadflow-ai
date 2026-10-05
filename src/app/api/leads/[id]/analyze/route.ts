import { getApiTranslations } from '@/i18n/api'
import { prisma } from '@/lib/prisma'
import { analyzeLead, InvalidAnalysisError, MissingOpenAIKeyError } from '@/lib/ai/analyze-lead'
import { analysisSchema } from '@/lib/ai/analysis-schema'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { authorizeAdminMutation } from '@/lib/auth/request'
import { leadIdSchema } from '@/lib/lead-status'

export const runtime = 'nodejs'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const t = await getApiTranslations(request)
	const denied = await authorizeAdminMutation(request)
	if (denied) return denied
	const { id } = await params
	if (!leadIdSchema.safeParse(id).success) {
		return Response.json({ success: false, message: t('invalidId') }, { status: 400 })
	}

	let lead
	try {
		lead = await prisma.lead.findUnique({
			where: { id },
			select: { name: true, service: true, budget: true, message: true },
		})
	} catch {
		return Response.json({ success: false, message: t('loadFailed') }, { status: 503 })
	}
	if (!lead) {
		return Response.json({ success: false, message: t('notFound') }, { status: 404 })
	}

	let analysis
	try {
		analysis = analysisSchema.parse(await analyzeLead(lead))
	} catch (error) {
		if (error instanceof MissingOpenAIKeyError) {
			return Response.json({ success: false, message: t('aiSetup') }, { status: 503 })
		}
		if (error instanceof InvalidAnalysisError || error instanceof z.ZodError) {
			return Response.json({ success: false, message: t('aiInvalid') }, { status: 502 })
		}
		return Response.json({ success: false, message: t('aiUnavailable') }, { status: 502 })
	}

	let saved
	try {
		saved = await prisma.lead.update({
			where: { id },
			data: {
				aiSummary: analysis.summary,
				aiPriority: analysis.priority,
				aiIntent: analysis.intent,
				aiSuggestedReply: analysis.suggestedReply,
				aiAnalyzedAt: new Date(),
			},
			select: { aiSummary: true, aiPriority: true, aiIntent: true, aiSuggestedReply: true, aiAnalyzedAt: true },
		})
	} catch {
		return Response.json({ success: false, message: t('analysisSave') }, { status: 503 })
	}

	revalidatePath('/[locale]/dashboard', 'page')
	return Response.json({ success: true, analysis: saved })
}
