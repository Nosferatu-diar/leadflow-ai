import { z } from 'zod'
import type { LeadStatus } from '@prisma/client'

export const leadStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'] as const

export const statusLabels = {
	NEW: 'New',
	CONTACTED: 'Contacted',
	QUALIFIED: 'Qualified',
	WON: 'Won',
	LOST: 'Lost',
} satisfies Record<LeadStatus, string>

export const leadIdSchema = z.cuid({ error: 'Invalid lead ID.' })
export const statusUpdateSchema = z.object({
	status: z.enum(leadStatuses, { error: 'Choose a valid lead status.' }),
}).strict()
