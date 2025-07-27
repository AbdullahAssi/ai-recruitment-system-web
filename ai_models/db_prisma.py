import psycopg2
import json
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the environment variables.")


def get_db_connection():
    """Get a database connection using the DATABASE_URL from environment."""
    return psycopg2.connect(DATABASE_URL)


def create_candidate_if_not_exists(name, email):
    """Create a candidate if they don't exist, return candidate ID."""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check if candidate exists
        cursor.execute("SELECT id FROM candidates WHERE email = %s", (email,))
        result = cursor.fetchone()

        if result:
            return result[0]

        # Create new candidate
        cursor.execute(
            """
            INSERT INTO candidates (name, email, experience)
            VALUES (%s, %s, %s)
            RETURNING id
        """,
            (name, email, 0),
        )  # Default experience to 0, will be updated from resume

        candidate_id = cursor.fetchone()[0]
        conn.commit()
        return candidate_id

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def extract_experience_years(work_experience_json):
    """Extract total years of experience from work experience data."""
    if not work_experience_json:
        return 0

    try:
        work_exp = (
            json.loads(work_experience_json)
            if isinstance(work_experience_json, str)
            else work_experience_json
        )
        total_months = 0

        for exp in work_exp:
            if isinstance(exp, dict) and "duration_in_months" in exp:
                total_months += exp.get("duration_in_months", 0)

        return total_months // 12  # Convert to years
    except:
        return 0


def insert_resume(filename, data):
    """Insert resume data into the database following Prisma schema."""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Extract basic info
        name = data.get("Name", "")
        email = data.get("Email", "")

        # Create or get candidate
        candidate_id = create_candidate_if_not_exists(name, email)

        # Update candidate experience
        experience_years = extract_experience_years(data.get("Work Experience"))
        cursor.execute(
            """
            UPDATE candidates SET experience = %s WHERE id = %s
        """,
            (experience_years, candidate_id),
        )

        # Insert resume
        cursor.execute(
            """
            INSERT INTO resumes (
                candidateId, filePath, fileName, filename, name, email, 
                linkedin, github, skills_json, experience_json, 
                projects_json, certifications_json
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """,
            (
                candidate_id,
                f"data/{filename}",  # filePath
                filename,  # fileName
                filename,  # filename (legacy field)
                name,  # name
                email,  # email
                data.get("LinkedIn"),
                data.get("GitHub"),
                json.dumps(data.get("Skills")),
                json.dumps(data.get("Work Experience")),
                json.dumps(data.get("Projects")),
                json.dumps(data.get("Certifications")),
            ),
        )

        resume_id = cursor.fetchone()[0]
        conn.commit()

        print(
            f"✅ Created candidate {candidate_id} and resume {resume_id} for {filename}"
        )
        return resume_id

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def insert_cv_score(resume_id, job_description, score, explanation):
    """Insert CV score into the database."""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO cv_scores (resume_id, job_description, score, explanation)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        """,
            (resume_id, job_description, score, explanation),
        )

        score_id = cursor.fetchone()[0]
        conn.commit()
        return score_id

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def get_all_resumes():
    """Get all resumes with candidate information."""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT r.id, r.filename, r.name, r.email, r.linkedin, r.github,
                   r.skills_json, r.experience_json, r.projects_json, r.certifications_json,
                   c.experience
            FROM resumes r
            JOIN candidates c ON r.candidateId = c.id
            ORDER BY r.uploadDate DESC
        """
        )

        results = cursor.fetchall()
        return results

    except Exception as e:
        raise e
    finally:
        cursor.close()
        conn.close()


# Note: Since you're using Prisma, you don't need to create tables manually
# Prisma handles the database schema through migrations
def create_tables():
    """
    This function is kept for compatibility but is not needed when using Prisma.
    Prisma handles table creation through migrations.
    Run 'npx prisma migrate dev' instead.
    """
    print("⚠️  Note: When using Prisma, tables are created through migrations.")
    print("   Run 'npx prisma migrate dev' to create/update your database schema.")
    pass
