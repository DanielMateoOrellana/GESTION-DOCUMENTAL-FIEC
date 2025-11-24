-- CreateTable
CREATE TABLE "StepFile" (
    "id" SERIAL NOT NULL,
    "stepId" INTEGER NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "content" BYTEA NOT NULL,
    "uploadedById" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StepFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StepFile_stepId_version_key" ON "StepFile"("stepId", "version");

-- AddForeignKey
ALTER TABLE "StepFile" ADD CONSTRAINT "StepFile_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "StepInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
