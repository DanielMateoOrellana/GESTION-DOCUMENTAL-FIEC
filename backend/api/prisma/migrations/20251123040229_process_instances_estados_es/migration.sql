-- CreateEnum
CREATE TYPE "EstadoProceso" AS ENUM ('PENDIENTE', 'COMPLETADO');

-- CreateEnum
CREATE TYPE "EstadoPaso" AS ENUM ('PENDIENTE', 'COMPLETADO');

-- CreateTable
CREATE TABLE "ProcessInstance" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "estado" "EstadoProceso" NOT NULL DEFAULT 'PENDIENTE',
    "processTypeId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "responsibleUserId" INTEGER,
    "year" INTEGER,
    "month" INTEGER,
    "comment" TEXT,
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepInstance" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "estado" "EstadoPaso" NOT NULL DEFAULT 'PENDIENTE',
    "comment" TEXT,
    "processInstanceId" INTEGER NOT NULL,
    "templateStepId" INTEGER NOT NULL,
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StepInstance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProcessInstance" ADD CONSTRAINT "ProcessInstance_processTypeId_fkey" FOREIGN KEY ("processTypeId") REFERENCES "ProcessType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessInstance" ADD CONSTRAINT "ProcessInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ProcessTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepInstance" ADD CONSTRAINT "StepInstance_processInstanceId_fkey" FOREIGN KEY ("processInstanceId") REFERENCES "ProcessInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepInstance" ADD CONSTRAINT "StepInstance_templateStepId_fkey" FOREIGN KEY ("templateStepId") REFERENCES "ProcessTemplateStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
