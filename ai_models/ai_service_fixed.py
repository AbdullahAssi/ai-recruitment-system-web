"""
AI Processing Service for Resume Analysis
Integrates OpenAI extraction and scoring with Next.js/Prisma workflow
"""

import sys
import os
import json
import asyncio
from pathlib import Path

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import extract_cv_info, read_cv_file
from db import insert_resume, get_db_connection
from scoring_agent.scorer import score_single_resume


class AIProcessingService:
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent

    def process_resume_file(self, file_path: str, resume_id: str = None):
        """
        Process a resume file through the AI pipeline:
        1. Extract text and structured data using OpenAI
        2. Update resume record in database
        3. Return extracted data for further processing
        """
        try:
            print(f"[INFO] Processing resume: {file_path}")

            # Read CV file
            cv_text = read_cv_file(file_path)

            # Extract structured information using OpenAI
            extracted_data = extract_cv_info(cv_text)
            print(f"[SUCCESS] Extracted data: {json.dumps(extracted_data, indent=2)}")

            # Update resume record with extracted data
            if resume_id:
                self._update_resume_with_extracted_data(
                    resume_id, extracted_data, cv_text
                )
            else:
                # Create new resume record
                filename = os.path.basename(file_path)
                resume_id = insert_resume(filename, extracted_data)

            return {
                "success": True,
                "resume_id": resume_id,
                "extracted_data": extracted_data,
                "message": "Resume processed successfully",
            }

        except Exception as e:
            print(f"[ERROR] Error processing resume {file_path}: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to process resume",
            }

    def _update_resume_with_extracted_data(
        self, resume_id: str, extracted_data: dict, cv_text: str
    ):
        """Update existing resume record with extracted AI data."""
        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            cursor.execute(
                """
                UPDATE resumes 
                SET 
                    name = %s,
                    email = %s,
                    linkedin = %s,
                    github = %s,
                    skills_json = %s,
                    experience_json = %s,
                    projects_json = %s,
                    certifications_json = %s,
                    "extractedText" = %s
                WHERE id = %s
            """,
                (
                    extracted_data.get("Name"),
                    extracted_data.get("Email"),
                    extracted_data.get("LinkedIn"),
                    extracted_data.get("GitHub"),
                    json.dumps(extracted_data.get("Skills", {})),
                    json.dumps(extracted_data.get("Work Experience", [])),
                    json.dumps(extracted_data.get("Projects", [])),
                    json.dumps(extracted_data.get("Certifications", [])),
                    cv_text,
                    resume_id,
                ),
            )

            conn.commit()
            print(f"[SUCCESS] Updated resume {resume_id} with extracted data")

        except Exception as e:
            conn.rollback()
            print(f"[ERROR] Error updating resume {resume_id}: {e}")
            raise e
        finally:
            cursor.close()
            conn.close()

    def score_resume_against_job(self, resume_id: str, job_description: str):
        """
        Score a resume against a specific job description using AI.
        """
        try:
            print(f"[INFO] Scoring resume {resume_id} against job description")

            result = score_single_resume(resume_id, job_description)

            print(f"[SUCCESS] Scoring completed: {result}")
            return {
                "success": True,
                "result": result,
                "message": "Resume scored successfully",
            }

        except Exception as e:
            print(f"[ERROR] Error scoring resume {resume_id}: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to score resume",
            }

    def full_pipeline_process(
        self, file_path: str, job_description: str = None, resume_id: str = None
    ):
        """
        Run the complete AI pipeline:
        1. Process and extract resume data
        2. Score against job description (if provided)
        """
        try:
            # Step 1: Process resume
            process_result = self.process_resume_file(file_path, resume_id)
            if not process_result["success"]:
                return process_result

            resume_id = process_result["resume_id"]
            extracted_data = process_result["extracted_data"]

            # Step 2: Score against job (if job description provided)
            scoring_result = None
            if job_description:
                scoring_result = self.score_resume_against_job(
                    resume_id, job_description
                )

            return {
                "success": True,
                "resume_id": resume_id,
                "extracted_data": extracted_data,
                "scoring_result": scoring_result,
                "message": "Full pipeline completed successfully",
            }

        except Exception as e:
            print(f"[ERROR] Error in full pipeline: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Pipeline processing failed",
            }


def main():
    """Command line interface for testing."""
    import argparse

    parser = argparse.ArgumentParser(description="AI Resume Processing Service")
    parser.add_argument("--file", required=True, help="Path to resume file")
    parser.add_argument("--job", help="Job description for scoring")
    parser.add_argument("--resume-id", help="Existing resume ID to update")

    args = parser.parse_args()

    service = AIProcessingService()
    result = service.full_pipeline_process(
        file_path=args.file, job_description=args.job, resume_id=args.resume_id
    )

    print("\n" + "=" * 50)
    print("FINAL RESULT:")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
