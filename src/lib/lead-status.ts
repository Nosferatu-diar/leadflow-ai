import { z } from 'zod'

export const leadStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'] as const

export const leadIdSchema = z.cuid({ error: 'Invalid lead ID.' })
export const statusUpdateSchema = z.object({
	status: z.enum(leadStatuses, { error: 'Choose a valid lead status.' }),
}).strict()
