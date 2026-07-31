-- CreateTable
CREATE TABLE "TutorLanguage" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "proficiency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TutorLanguage_tutorId_language_key" ON "TutorLanguage"("tutorId", "language");

-- CreateIndex
CREATE INDEX "TutorLanguage_tutorId_idx" ON "TutorLanguage"("tutorId");

-- AddForeignKey
ALTER TABLE "TutorLanguage" ADD CONSTRAINT "TutorLanguage_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;