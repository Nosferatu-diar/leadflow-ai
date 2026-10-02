-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('Telegram', 'Email', 'Phone');

-- CreateEnum
CREATE TYPE "Service" AS ENUM ('Website', 'Web Application', 'AI Automation', 'Other');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactMethod" "ContactMethod" NOT NULL,
    "contact" TEXT NOT NULL,
    "service" "Service" NOT NULL,
    "budget" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
