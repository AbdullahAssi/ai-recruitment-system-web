"""
Database operations for the CV-JD matching system.
This module handles PostgreSQL operations using Prisma or psycopg2.
"""

import os
import json
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
import secrets
import string

# Load environment variables
load_dotenv()  # This will look for .env in the current directory


def generate_cuid():
    """Generate a CUID-like ID for Prisma compatibility"""
    # Simple CUID-like implementation
    chars = string.ascii_lowercase + string.digits
    return "c" + "".join(secrets.choice(chars) for _ in range(24))


# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")


def get_connection():
    """Get database connection."""
    try:
        if not DATABASE_URL:
            print("[ERROR] DATABASE_URL not found in environment variables")
            return None

        # Remove the Prisma Accelerate wrapper if present
        if "prisma://" in DATABASE_URL:
            print("[WARNING] Note: Using Prisma Accelerate URL detected.")
            # For direct connection, you might need to convert the URL
            # This is a simplified approach - in production, handle this properly

        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"[ERROR] Database connection failed: {e}")
        return None


def create_tables():
    """Create necessary tables if they don't exist."""
    conn = get_connection()
    if not conn:
        return False

    try:
        cursor = conn.cursor()

        # Create candidates table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS candidates (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(50),
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

        # Create resumes table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS resumes (
                id SERIAL PRIMARY KEY,
                candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
                filename VARCHAR(255) NOT NULL,
                file_path TEXT NOT NULL,
                extracted_text TEXT,
                skills TEXT[],
                experience_years INTEGER,
                education_level VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

        # Create cv_scores table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS cv_scores (
                id SERIAL PRIMARY KEY,
                resume_id INTEGER REFERENCES resumes(id) ON DELETE CASCADE,
                job_id INTEGER NOT NULL,
                score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
                details JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

        conn.commit()
        print(
            "[WARNING] Note: When using Prisma, tables are created through migrations."
        )
        return True

    except Exception as e:
        print(f"[ERROR] Error creating tables: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def insert_resume_data(
    filename,
    file_path,
    extracted_text,
    extracted_data_dict,
    candidate_name="Unknown",
    candidate_email=None,
):
    """Insert resume data into the database."""
    conn = get_connection()
    if not conn:
        return None, None

    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # First, create or get candidate
        if not candidate_email:
            candidate_email = f"candidate_{filename.split('.')[0]}@example.com"

        candidate_id = generate_cuid()

        cursor.execute(
            """
            INSERT INTO candidates (id, name, email, experience, "createdAt", "updatedAt") 
            VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
            ON CONFLICT (email) DO UPDATE SET 
                name = EXCLUDED.name,
                experience = EXCLUDED.experience,
                "updatedAt" = CURRENT_TIMESTAMP
            RETURNING id
        """,
            (
                candidate_id,
                candidate_name,
                candidate_email,
                extracted_data_dict.get("experience_years", 0),
            ),
        )

        candidate_result = cursor.fetchone()
        candidate_id = candidate_result["id"]

        # Insert resume using Prisma column names with all extracted data
        resume_id = generate_cuid()
        cursor.execute(
            """
            INSERT INTO resumes (
                id, "candidateId", "filePath", "fileName", "extractedText", 
                name, email, linkedin, github, 
                skills_json, experience_json, projects_json, certifications_json, "uploadDate"
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            RETURNING id
        """,
            (
                resume_id,
                candidate_id,
                file_path,
                filename,
                extracted_text,
                extracted_data_dict.get("name"),
                extracted_data_dict.get("email"),
                extracted_data_dict.get("linkedin"),
                extracted_data_dict.get("github"),
                json.dumps(extracted_data_dict.get("skills", [])),
                json.dumps(extracted_data_dict.get("work_experience", [])),
                json.dumps(extracted_data_dict.get("projects", [])),
                json.dumps(extracted_data_dict.get("certifications", [])),
            ),
        )

        resume_result = cursor.fetchone()
        resume_id = resume_result["id"]

        conn.commit()
        print(
            f"[SUCCESS] Created candidate {candidate_id} and resume {resume_id} for {filename}"
        )
        return candidate_id, resume_id

    except Exception as e:
        print(f"[ERROR] Error inserting resume {filename}: {e}")
        conn.rollback()
        return None, None
    finally:
        cursor.close()
        conn.close()


def insert_cv_score(resume_id, job_id, score, details, application_id=None, **kwargs):
    """Insert CV score into the database with enhanced scoring support."""
    conn = get_connection()
    if not conn:
        return None

    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Generate a unique ID for the score
        score_id = generate_cuid()

        # Extract enhanced scoring data if available
        overall_score = kwargs.get("overall_score", score)
        recommendation = kwargs.get("recommendation", "CONSIDER")
        summary = kwargs.get("summary", "No summary available")

        # Prepare comprehensive scoring data for JSON storage
        enhanced_details = {
            "overall_score": overall_score,
            "skills_score": kwargs.get("skills_score", 0),
            "experience_score": kwargs.get("experience_score", 0),
            "education_score": kwargs.get("education_score", 0),
            "fit_score": kwargs.get("fit_score", 0),
            "detailed_analysis": kwargs.get("detailed_analysis", {}),
            "recommendation": recommendation,
            "summary": summary,
            "raw_response": kwargs.get("raw_response", ""),
        }

        # Skills matching data
        skills_match = kwargs.get("skills_match", {})

        # Requirements analysis data
        requirements_analysis = kwargs.get("requirements_analysis", {})

        cursor.execute(
            """
            INSERT INTO cv_scores (
                id, "resumeId", "jobId", "applicationId", score, 
                explanation, "skillsMatch", requirements 
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """,
            (
                score_id,
                resume_id,
                job_id,
                application_id,
                overall_score,
                json.dumps(enhanced_details),
                json.dumps(skills_match),
                json.dumps(requirements_analysis),
            ),
        )

        score_result = cursor.fetchone()
        returned_score_id = score_result["id"]

        conn.commit()
        print(
            f"[SUCCESS] Created enhanced CV score {returned_score_id} for resume {resume_id}"
        )
        return returned_score_id

    except Exception as e:
        print(f"[ERROR] Error inserting enhanced CV score: {e}")
        conn.rollback()
        return None
    finally:
        cursor.close()
        conn.close()


def get_all_resumes():
    """Get all resumes from the database."""
    conn = get_connection()
    if not conn:
        return []

    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute(
            """
            SELECT r.*, c.name as candidate_name, c.email as candidate_email
            FROM resumes r
            JOIN candidates c ON r.candidate_id = c.id
            ORDER BY r.created_at DESC
        """
        )

        resumes = cursor.fetchall()
        return [dict(resume) for resume in resumes]

    except Exception as e:
        print(f"[ERROR] Error fetching resumes: {e}")
        return []
    finally:
        cursor.close()
        conn.close()


def get_cv_scores_for_resume(resume_id):
    """Get all CV scores for a specific resume."""
    conn = get_connection()
    if not conn:
        return []

    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute(
            """
            SELECT * FROM cv_scores 
            WHERE resume_id = %s 
            ORDER BY created_at DESC
        """,
            (resume_id,),
        )

        scores = cursor.fetchall()
        return [dict(score) for score in scores]

    except Exception as e:
        print(f"[ERROR] Error fetching scores for resume {resume_id}: {e}")
        return []
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    # Test database connection
    print("Testing database connection...")
    create_tables()
    print("Database operations test complete.")
