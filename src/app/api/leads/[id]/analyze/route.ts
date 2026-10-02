import { prisma } from '@/lib/prisma'
import { analyzeLead, InvalidAnalysisError, MissingOpenAIKeyError } from '@/lib/ai/analyze-lead'
import { analysisSchema } from '@/lib/ai/analysis-schema'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export const runtime = 'nodejs'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	if (!z.string().min(1).max(100).safeParse(id).success) {
		return Response.json({ success: false, message: 'Invalid lead ID.' }, { status: 400 })
	}

	let lead
	try {
		lead = await prisma.lead.findUnique({
			where: { id },
			select: { name: true, service: true, budget: true, message: true },
		})
	} catch {
		return Response.json({ success: false, message: 'Unable to load the lead. Please try again later.' }, { status: 503 })
	}
	if (!lead) {
		return Response.json({ success: false, message: 'Lead not found.' }, { status: 404 })
	}

	let analysis
	try {
		analysis = analysisSchema.parse(await analyzeLead(lead))
	} catch (error) {
		if (error instanceof MissingOpenAIKeyError) {
			return Response.json({ success: false, message: 'AI analysis is not configured. Set OPENAI_API_KEY on the server.' }, { status: 503 })
		}
		if (error instanceof InvalidAnalysisError || error instanceof z.ZodError) {
			return Response.json({ success: false, message: 'AI returned an invalid or incomplete analysis. Please try again.' }, { status: 502 })
		}
		return Response.json({ success: false, message: 'AI analysis is unavailable. Please try again later.' }, { status: 502 })
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
		return Response.json({ success: false, message: 'Unable to save the analysis. Please try again later.' }, { status: 503 })
	}

	revalidatePath('/dashboard')
	return Response.json({ success: true, analysis: saved })
}
