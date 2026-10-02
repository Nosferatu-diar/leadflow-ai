import { PrismaClient } from '@prisma/client'
import 'server-only'

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined
}

// Reuse the client across development hot reloads. Connections open on demand.
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma
}
