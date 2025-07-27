import json
import os
import sys
from langchain_chain import get_scoring_chain
from retriever import load_knowledge_base

# Add parent directory to path to import db module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db import get_db_connection, insert_cv_score


def load_job_description(filepath="jd.txt"):
    """Load job description from file."""
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()


def fetch_parsed_resumes():
    """Fetch parsed resumes from PostgreSQL database using Prisma schema."""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT r.id, r.name, r.email, r.skills_json, r.experience_json, r.projects_json
            FROM resumes r
            WHERE r.skills_json IS NOT NULL OR r.experience_json IS NOT NULL
        """
        )
        rows = cursor.fetchall()

        parsed_resumes = []
        for row in rows:
            resume_id, name, email, skills_json, experience_json, projects_json = row

            try:
                skills = ", ".join(json.loads(skills_json)) if skills_json else ""
                experience_list = json.loads(experience_json) if experience_json else []
                experience = "\n".join(
                    [
                        f"- {item}" if isinstance(item, str) else json.dumps(item)
                        for item in experience_list
                    ]
                )

                project_list = json.loads(projects_json) if projects_json else []
                projects = "\n".join(
                    [
                        f"- {item}" if isinstance(item, str) else json.dumps(item)
                        for item in project_list
                    ]
                )
            except Exception as e:
                print(f"⚠️ Error parsing resume ID {resume_id}: {e}")
                skills, experience, projects = "", "", ""

            parsed_resumes.append(
                (resume_id, name, email, skills, experience, projects)
            )

        return parsed_resumes

    except Exception as e:
        print(f"❌ Error fetching resumes: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()


def save_score(resume_id, jd, score, explanations):
    """Save CV score using PostgreSQL database and Prisma schema."""
    try:
        insert_cv_score(resume_id, jd, score, explanations)
        print(f"✅ Saved score {score} for resume {resume_id}")
    except Exception as e:
        print(f"❌ Error saving score for resume {resume_id}: {e}")
        raise e


def score_single_resume(resume_id, job_description):
    """Score a single resume against a job description."""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Fetch single resume
        cursor.execute(
            """
            SELECT r.id, r.name, r.email, r.skills_json, r.experience_json, r.projects_json
            FROM resumes r
            WHERE r.id = %s
        """,
            (resume_id,),
        )

        row = cursor.fetchone()
        if not row:
            raise ValueError(f"Resume with ID {resume_id} not found")

        resume_id, name, email, skills_json, experience_json, projects_json = row

        try:
            skills = ", ".join(json.loads(skills_json)) if skills_json else ""
            experience_list = json.loads(experience_json) if experience_json else []
            experience = "\n".join(
                [
                    f"- {item}" if isinstance(item, str) else json.dumps(item)
                    for item in experience_list
                ]
            )

            project_list = json.loads(projects_json) if projects_json else []
            projects = "\n".join(
                [
                    f"- {item}" if isinstance(item, str) else json.dumps(item)
                    for item in project_list
                ]
            )
        except Exception as e:
            print(f"⚠️ Error parsing resume ID {resume_id}: {e}")
            skills, experience, projects = "", "", ""

        # Format resume for scoring
        resume_text = f"""
Name: {name}
Email: {email}
Skills: {skills}
Experience: {experience}
Projects: {projects}
        """.strip()

        # Get scoring chain and load knowledge base
        scoring_chain = get_scoring_chain()
        knowledge = load_knowledge_base()

        # Score the resume
        result = scoring_chain.run(
            {
                "job_description": job_description,
                "resume": resume_text,
                "knowledge": knowledge,
            }
        )

        # Parse the result
        result_json = json.loads(result)
        score = result_json.get("score", 0)
        explanation = result_json.get("explanation", "No explanation provided")

        # Save the score
        save_score(resume_id, job_description, score, explanation)

        return {"resume_id": resume_id, "score": score, "explanation": explanation}

    except Exception as e:
        print(f"❌ Error scoring resume {resume_id}: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()


def run_scoring_pipeline():
    """Load job description, fetch parsed resumes, and score them."""
    try:
        jd = load_job_description()
        print(f"Job Description: {jd[:100]}...")

        resumes = fetch_parsed_resumes()
        print(f"Found {len(resumes)} parsed resumes.")

        scoring_chain = get_scoring_chain()
        knowledge = load_knowledge_base()

        results = []
        for resume_id, name, email, skills, experience, projects in resumes:
            print(f"\n--- Scoring Resume ID: {resume_id} ({name}) ---")

            # Format the resume for the LLM
            resume_text = f"""
Name: {name}
Email: {email}
Skills: {skills}
Experience: {experience}
Projects: {projects}
            """.strip()

            # Run the LLM chain
            result = scoring_chain.run(
                {"job_description": jd, "resume": resume_text, "knowledge": knowledge}
            )

            print(f"LLM Result: {result}")

            # Parse the result
            try:
                result_json = json.loads(result)
                score = result_json.get("score", 0)
                explanation = result_json.get("explanation", "No explanation provided")
            except json.JSONDecodeError:
                print(f"⚠️ Could not parse JSON result for {name}. Skipping...")
                continue

            # Save to database
            save_score(resume_id, jd, score, explanation)
            results.append(
                {
                    "resume_id": resume_id,
                    "name": name,
                    "score": score,
                    "explanation": explanation,
                }
            )

            print(f"Score: {score}, Explanation: {explanation[:50]}...")

        return results

    except Exception as e:
        print(f"❌ Error in scoring pipeline: {e}")
        raise e


if __name__ == "__main__":
    # Example usage
    try:
        resumes = fetch_parsed_resumes()
        print(f"Found {len(resumes)} resumes in database")

        # Load job description
        jd = load_job_description()
        print(f"Loaded job description: {jd[:100]}...")

        # Score first resume as example
        if resumes:
            first_resume = resumes[0]
            result = score_single_resume(first_resume[0], jd)
            print(f"Scored resume: {result}")

    except Exception as e:
        print(f"❌ Error in scoring pipeline: {e}")
