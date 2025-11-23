-- CreateTable
CREATE TABLE "ProcessTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "processTypeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessTemplateStep" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "responsibleRole" TEXT,
    "dueDaysFromStart" INTEGER,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessTemplateStep_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProcessTemplate" ADD CONSTRAINT "ProcessTemplate_processTypeId_fkey" FOREIGN KEY ("processTypeId") REFERENCES "ProcessType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessTemplateStep" ADD CONSTRAINT "ProcessTemplateStep_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ProcessTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
