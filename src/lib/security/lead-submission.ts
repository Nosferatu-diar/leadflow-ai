import 'server-only'
import { z } from 'zod'

// These client-supplied signals deter simple bots; they are not proof of humanity.
const submissionSignals = z.object({
	website: z.string().max(0),
	formFillTimeMs: z.number().finite().min(750).max(Number.MAX_SAFE_INTEGER),
})

export function hasValidSubmissionSignals(body: unknown) {
	return submissionSignals.safeParse(body).success
}
