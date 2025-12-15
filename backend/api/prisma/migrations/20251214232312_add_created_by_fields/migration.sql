-- AlterTable
ALTER TABLE "ProcessCategory" ADD COLUMN     "createdById" INTEGER;

-- AlterTable
ALTER TABLE "ProcessInstance" ADD COLUMN     "createdById" INTEGER;

-- AlterTable
ALTER TABLE "ProcessTemplate" ADD COLUMN     "createdById" INTEGER;

-- AlterTable
ALTER TABLE "ProcessType" ADD COLUMN     "createdById" INTEGER;

-- AddForeignKey
ALTER TABLE "ProcessCategory" ADD CONSTRAINT "ProcessCategory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessType" ADD CONSTRAINT "ProcessType_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessTemplate" ADD CONSTRAINT "ProcessTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessInstance" ADD CONSTRAINT "ProcessInstance_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
