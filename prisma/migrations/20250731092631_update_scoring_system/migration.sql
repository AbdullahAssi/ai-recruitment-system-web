/*
 Warnings:
 
 - You are about to drop the column `job_description` on the `cv_scores` table. All the data in the column will be lost.
 - You are about to drop the column `resume_id` on the `cv_scores` table. All the data in the column will be lost.
 - You are about to drop the column `scored_at` on the `cv_scores` table. All the data in the column will be lost.
 - A unique constraint covering the columns `[applicationId]` on the table `cv_scores` will be added. If there are existing duplicate values, this will fail.
 - Added the required column `resumeId` to the `cv_scores` table without a default value. This is not possible if the table is not empty.
 
 */
-- Step 1: Add new columns with nullable constraints first
ALTER TABLE "cv_scores"
ADD COLUMN "applicationId" TEXT,
  ADD COLUMN "jobId" TEXT,
  ADD COLUMN "requirements" JSONB,
  ADD COLUMN "resumeId" TEXT,
  ADD COLUMN "scoredAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "skillsMatch" JSONB;
-- Step 2: Migrate existing data
UPDATE "cv_scores"
SET "resumeId" = "resume_id",
  "scoredAt" = COALESCE("scored_at", CURRENT_TIMESTAMP);
-- Step 3: Make resumeId NOT NULL after data migration
ALTER TABLE "cv_scores"
ALTER COLUMN "resumeId"
SET NOT NULL;
ALTER TABLE "cv_scores"
ALTER COLUMN "scoredAt"
SET NOT NULL;
-- Step 4: Drop old foreign key constraint
ALTER TABLE "cv_scores" DROP CONSTRAINT "cv_scores_resume_id_fkey";
-- Step 5: Drop old columns
ALTER TABLE "cv_scores" DROP COLUMN "job_description",
  DROP COLUMN "resume_id",
  DROP COLUMN "scored_at";
-- Step 6: Create new constraints and indexes
CREATE UNIQUE INDEX "cv_scores_applicationId_key" ON "cv_scores"("applicationId");
-- Step 7: Add new foreign key constraints
ALTER TABLE "cv_scores"
ADD CONSTRAINT "cv_scores_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cv_scores"
ADD CONSTRAINT "cv_scores_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cv_scores"
ADD CONSTRAINT "cv_scores_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;