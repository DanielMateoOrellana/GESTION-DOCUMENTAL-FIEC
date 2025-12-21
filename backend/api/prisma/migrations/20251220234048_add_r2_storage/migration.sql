/*
  Warnings:

  - Added the required column `storageKey` to the `StepFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StepFile" ADD COLUMN     "storageKey" TEXT NOT NULL,
ALTER COLUMN "content" DROP NOT NULL;
