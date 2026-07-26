-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');


-- CreateTable
CREATE TABLE "TutorWeeklySlot" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "serviceMode" "ServiceMode" NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorWeeklySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorBreakPeriod" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek",
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorBreakPeriod_pkey" PRIMARY KEY ("id")
);


-- CreateIndex
CREATE INDEX "TutorWeeklySlot_tutorId_dayOfWeek_idx" ON "TutorWeeklySlot"("tutorId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "TutorWeeklySlot_tutorId_dayOfWeek_startTime_serviceMode_key" ON "TutorWeeklySlot"("tutorId", "dayOfWeek", "startTime", "serviceMode");

-- CreateIndex
CREATE INDEX "TutorBreakPeriod_tutorId_idx" ON "TutorBreakPeriod"("tutorId");


-- AddForeignKey
ALTER TABLE "TutorWeeklySlot" ADD CONSTRAINT "TutorWeeklySlot_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorBreakPeriod" ADD CONSTRAINT "TutorBreakPeriod_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
