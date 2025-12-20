/*
  Warnings:

  - You are about to drop the `ProcessInstanceTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProcessInstanceTag" DROP CONSTRAINT "ProcessInstanceTag_processInstanceId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessInstanceTag" DROP CONSTRAINT "ProcessInstanceTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_createdById_fkey";

-- DropTable
DROP TABLE "ProcessInstanceTag";

-- DropTable
DROP TABLE "Tag";
