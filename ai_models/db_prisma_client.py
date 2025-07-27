import asyncio
import json
import os
from datetime import datetime
from dotenv import load_dotenv
from prisma import Prisma

load_dotenv()

# This will work with your Prisma Accelerate URL!
prisma = Prisma()


def read_cv_file(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()


def create_tables():
    """
    Note: When using Prisma, tables are created through migrations.
    Run 'npx prisma migrate dev' to create/update your database schema.
    """
    print("⚠️  Note: When using Prisma, tables are created through migrations.")
    print("   Run 'npx prisma migrate dev' to create/update your database schema.")
    pass


async def create_candidate_if_not_exists(name, email):
    """Create a candidate if they don't exist, return candidate ID."""
    # Check if candidate exists
    existing_candidate = await prisma.candidate.find_first(where={"email": email})

    if existing_candidate:
        return existing_candidate.id

    # Create new candidate
    new_candidate = await prisma.candidate.create(
        data={"name": name, "email": email, "experience": 0}
    )

    return new_candidate.id


async def insert_resume_async(filename, data):
    """Insert resume data using Prisma Client Python with Accelerate support."""
    await prisma.connect()

    try:
        # Extract basic info
        name = data.get("Name", "")
        email = data.get("Email", "")

        # Create or get candidate
        candidate_id = await create_candidate_if_not_exists(name, email)

        # Insert resume
        resume = await prisma.resume.create(
            data={
                "candidateId": candidate_id,
                "filePath": f"data/{filename}",
                "fileName": filename,
                "filename": filename,
                "name": name,
                "email": email,
                "linkedin": data.get("LinkedIn"),
                "github": data.get("GitHub"),
                "skills_json": json.dumps(data.get("Skills")),
                "experience_json": json.dumps(data.get("Work Experience")),
                "projects_json": json.dumps(data.get("Projects")),
                "certifications_json": json.dumps(data.get("Certifications")),
            }
        )

        print(
            f"✅ Created candidate {candidate_id} and resume {resume.id} for {filename}"
        )
        return resume.id

    finally:
        await prisma.disconnect()


def insert_resume(filename, data):
    """Synchronous wrapper for async insert_resume."""
    return asyncio.run(insert_resume_async(filename, data))


async def insert_cv_score_async(resume_id, job_description, score, explanation):
    """Insert CV score using Prisma Client Python."""
    await prisma.connect()

    try:
        cv_score = await prisma.cvscore.create(
            data={
                "resume_id": resume_id,
                "job_description": job_description,
                "score": score,
                "explanation": explanation,
            }
        )

        print(f"✅ Created CV score {cv_score.id} for resume {resume_id}")
        return cv_score.id

    finally:
        await prisma.disconnect()


def insert_cv_score(resume_id, job_description, score, explanation):
    """Synchronous wrapper for async insert_cv_score."""
    return asyncio.run(
        insert_cv_score_async(resume_id, job_description, score, explanation)
    )


async def get_all_resumes_async():
    """Get all resumes with candidate information using Prisma."""
    await prisma.connect()

    try:
        resumes = await prisma.resume.find_many(
            include={"candidate": True}, order={"uploadDate": "desc"}
        )

        # Convert to tuple format for compatibility
        results = []
        for resume in resumes:
            results.append(
                (
                    resume.id,
                    resume.filename,
                    resume.name,
                    resume.email,
                    resume.linkedin,
                    resume.github,
                    resume.skills_json,
                    resume.experience_json,
                    resume.projects_json,
                    resume.certifications_json,
                    resume.candidate.name,
                    resume.candidate.experience,
                )
            )

        return results

    finally:
        await prisma.disconnect()


def get_all_resumes():
    """Synchronous wrapper for async get_all_resumes."""
    return asyncio.run(get_all_resumes_async())


async def get_resume_scores_async(resume_id):
    """Get all scores for a specific resume using Prisma."""
    await prisma.connect()

    try:
        scores = await prisma.cvscore.find_many(
            where={"resume_id": resume_id}, order={"scored_at": "desc"}
        )

        # Convert to tuple format for compatibility
        results = []
        for score in scores:
            results.append(
                (
                    score.id,
                    score.job_description,
                    score.score,
                    score.explanation,
                    score.scored_at,
                )
            )

        return results

    finally:
        await prisma.disconnect()


def get_resume_scores(resume_id):
    """Synchronous wrapper for async get_resume_scores."""
    return asyncio.run(get_resume_scores_async(resume_id))
