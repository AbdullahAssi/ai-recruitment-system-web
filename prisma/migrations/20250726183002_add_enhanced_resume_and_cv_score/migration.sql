-- AlterTable
ALTER TABLE "resumes" ADD COLUMN     "certifications_json" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "experience_json" TEXT,
ADD COLUMN     "filename" TEXT,
ADD COLUMN     "github" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "projects_json" TEXT,
ADD COLUMN     "skills_json" TEXT;

-- CreateTable
CREATE TABLE "cv_scores" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "job_description" TEXT,
    "score" INTEGER,
    "explanation" TEXT,
    "scored_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cv_scores_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cv_scores" ADD CONSTRAINT "cv_scores_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
