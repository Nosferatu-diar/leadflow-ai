import { z } from 'zod'

export const analysisSchema = z.strictObject({
	summary: z.string().trim().min(1).max(800),
	priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
	intent: z.string().trim().min(1).max(120),
	suggestedReply: z.string().trim().min(1).max(1200),
})

export type LeadAnalysis = z.infer<typeof analysisSchema>
