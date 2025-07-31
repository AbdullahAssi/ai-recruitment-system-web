"""
Enhanced AI Resume Scoring Service
Integrates job description and requirements for comprehensive scoring
"""

import sys
import os
import json
import uuid
import psycopg2
from typing import Dict, Any, Optional
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import extract_cv_info, read_cv_file
from db import get_connection
from scoring_agent.scorer import score_single_resume


class EnhancedScoringService:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))

    def get_comprehensive_job_context(self, job_id: str) -> Dict[str, Any]:
        """
        Fetch comprehensive job information including description, requirements, and skills
        """
        conn = get_connection()
        cursor = conn.cursor()

        try:
            # Get job details
            cursor.execute(
                """
                SELECT j.id, j.title, j.description, j.requirements, j.location, j.company
                FROM jobs j
                WHERE j.id = %s
            """,
                (job_id,),
            )

            job_row = cursor.fetchone()
            if not job_row:
                raise ValueError(f"Job with ID {job_id} not found")

            job_id, title, description, requirements, location, company = job_row

            # Get job skills
            cursor.execute(
                """
                SELECT js."skillName", js.required
                FROM job_skills js
                WHERE js."jobId" = %s
            """,
                (job_id,),
            )

            job_skills = []
            for skill_row in cursor.fetchall():
                skill_name, required = skill_row
                job_skills.append({"name": skill_name, "required": required})

            return {
                "id": job_id,
                "title": title,
                "description": description,
                "requirements": requirements,
                "location": location,
                "company": company,
                "skills": job_skills,
            }

        except Exception as e:
            print(f"[ERROR] Error fetching job context: {e}")
            raise e
        finally:
            cursor.close()
            conn.close()

    def get_resume_context(self, resume_id: str) -> Dict[str, Any]:
        """
        Fetch comprehensive resume information
        """
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute(
                """
                SELECT r.id, r."candidateId", r."filePath", r."fileName", r."extractedText",
                       r.name, r.email, r.skills_json, r.experience_json, r.projects_json,
                       r.certifications_json, r.linkedin, r.github, r.phone, 
                       r.education_level, r.experience_years, r.summary
                FROM resumes r
                WHERE r.id = %s
            """,
                (resume_id,),
            )

            resume_row = cursor.fetchone()
            if not resume_row:
                raise ValueError(f"Resume with ID {resume_id} not found")

            (
                resume_id,
                candidate_id,
                file_path,
                file_name,
                extracted_text,
                name,
                email,
                skills_json,
                experience_json,
                projects_json,
                certifications_json,
                linkedin,
                github,
                phone,
                education_level,
                experience_years,
                summary,
            ) = resume_row

            # Parse JSON fields safely
            def safe_json_parse(json_str):
                try:
                    return json.loads(json_str) if json_str else []
                except (json.JSONDecodeError, TypeError):
                    return []

            return {
                "id": resume_id,
                "candidateId": candidate_id,
                "filePath": file_path,
                "fileName": file_name,
                "extractedText": extracted_text,
                "name": name,
                "email": email,
                "skills": safe_json_parse(skills_json),
                "experience": safe_json_parse(experience_json),
                "projects": safe_json_parse(projects_json),
                "certifications": safe_json_parse(certifications_json),
                "linkedin": linkedin,
                "github": github,
                "phone": phone,
                "educationLevel": education_level,
                "experienceYears": experience_years,
                "summary": summary,
            }

        except Exception as e:
            print(f"[ERROR] Error fetching resume context: {e}")
            raise e
        finally:
            cursor.close()
            conn.close()

    def create_enhanced_job_description(self, job_context: Dict[str, Any]) -> str:
        """
        Create a comprehensive job description combining all available information
        """
        enhanced_description = f"""
=== JOB POSTING ===
Company: {job_context.get('company', 'Not specified')}
Title: {job_context['title']}
Location: {job_context.get('location', 'Not specified')}

=== JOB DESCRIPTION ===
{job_context['description']}

=== REQUIREMENTS ===
{job_context.get('requirements', 'Not specified')}

=== REQUIRED SKILLS ===
"""

        required_skills = [
            skill["name"] for skill in job_context["skills"] if skill["required"]
        ]
        preferred_skills = [
            skill["name"] for skill in job_context["skills"] if not skill["required"]
        ]

        if required_skills:
            enhanced_description += "\nRequired Skills:\n"
            for skill in required_skills:
                enhanced_description += f"- {skill}\n"

        if preferred_skills:
            enhanced_description += "\nPreferred Skills:\n"
            for skill in preferred_skills:
                enhanced_description += f"- {skill}\n"

        return enhanced_description.strip()

    def analyze_skill_matching(
        self, resume_context: Dict[str, Any], job_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Perform detailed skill matching analysis
        """
        resume_skills = []
        if isinstance(resume_context["skills"], list):
            resume_skills = [skill.lower() for skill in resume_context["skills"]]
        elif isinstance(resume_context["skills"], dict):
            # Handle different skill formats
            for category, skills in resume_context["skills"].items():
                if isinstance(skills, list):
                    resume_skills.extend([skill.lower() for skill in skills])

        job_skills_required = [
            skill["name"].lower()
            for skill in job_context["skills"]
            if skill["required"]
        ]
        job_skills_preferred = [
            skill["name"].lower()
            for skill in job_context["skills"]
            if not skill["required"]
        ]
        all_job_skills = job_skills_required + job_skills_preferred

        # Find matches
        matched_required = [
            skill
            for skill in job_skills_required
            if any(rs in skill or skill in rs for rs in resume_skills)
        ]
        matched_preferred = [
            skill
            for skill in job_skills_preferred
            if any(rs in skill or skill in rs for rs in resume_skills)
        ]
        missing_required = [
            skill for skill in job_skills_required if skill not in matched_required
        ]

        # Calculate scores
        required_score = (
            (len(matched_required) / len(job_skills_required)) * 100
            if job_skills_required
            else 100
        )
        preferred_score = (
            (len(matched_preferred) / len(job_skills_preferred)) * 100
            if job_skills_preferred
            else 100
        )
        overall_skill_score = (required_score * 0.8) + (preferred_score * 0.2)

        return {
            "matchedRequired": matched_required,
            "matchedPreferred": matched_preferred,
            "missingRequired": missing_required,
            "requiredScore": round(required_score, 2),
            "preferredScore": round(preferred_score, 2),
            "overallSkillScore": round(overall_skill_score, 2),
            "totalResumeSkills": len(resume_skills),
            "totalJobSkills": len(all_job_skills),
        }

    def score_application(self, application_id: str) -> Dict[str, Any]:
        """
        Score a specific job application with enhanced analysis
        """
        conn = get_connection()
        cursor = conn.cursor()

        try:
            # Get application details
            cursor.execute(
                """
                SELECT a.id, a."candidateId", a."jobId", a.score, a.status,
                       r.id as resumeId
                FROM applications a
                JOIN candidates c ON a."candidateId" = c.id
                JOIN resumes r ON c.id = r."candidateId"
                WHERE a.id = %s
                ORDER BY r."uploadDate" DESC
                LIMIT 1
            """,
                (application_id,),
            )

            app_row = cursor.fetchone()
            if not app_row:
                raise ValueError(f"Application with ID {application_id} not found")

            app_id, candidate_id, job_id, current_score, status, resume_id = app_row

            print(
                f"[INFO] Scoring application {app_id} for job {job_id} using resume {resume_id}"
            )

            # Get comprehensive context
            job_context = self.get_comprehensive_job_context(job_id)
            resume_context = self.get_resume_context(resume_id)

            # Create enhanced job description
            enhanced_job_description = self.create_enhanced_job_description(job_context)

            # Perform skill matching analysis
            skill_analysis = self.analyze_skill_matching(resume_context, job_context)

            # Use existing scorer with enhanced description (without resume_id to prevent duplicate DB insertion)
            scoring_result = score_single_resume(
                resume_data={
                    "name": resume_context.get("name"),
                    "email": resume_context.get("email"),
                    "skills": resume_context.get("skills", []),
                    "experience": resume_context.get("experience", []),
                    "projects": resume_context.get("projects", []),
                    "certifications": resume_context.get("certifications", []),
                    "summary": resume_context.get("summary"),
                    "experienceYears": resume_context.get("experienceYears"),
                },
                job_description=enhanced_job_description,
                resume_id=None,  # Don't pass resume_id to prevent duplicate database insertion
            )

            # Store enhanced scoring result
            self._store_enhanced_score(
                resume_id=resume_id,
                job_id=job_id,
                application_id=application_id,
                score=scoring_result.get("overall_score", 0),
                explanation=scoring_result.get("summary", ""),
                skill_analysis=skill_analysis,
                job_context=job_context,
                scoring_result=scoring_result,
            )

            # Update application score
            cursor.execute(
                """
                UPDATE applications 
                SET score = %s, status = %s
                WHERE id = %s
            """,
                (
                    scoring_result.get("overall_score", 0),
                    (
                        "REVIEWED"
                        if scoring_result.get("overall_score", 0) >= 70
                        else "PENDING"
                    ),
                    application_id,
                ),
            )
            conn.commit()

            return {
                "success": True,
                "applicationId": application_id,
                "score": scoring_result.get("overall_score", 0),
                "explanation": scoring_result.get("summary", ""),
                "skillAnalysis": skill_analysis,
                "jobContext": job_context,
                "scoringDetails": scoring_result,
            }

        except Exception as e:
            conn.rollback()
            print(f"[ERROR] Error scoring application {application_id}: {e}")
            raise e
        finally:
            cursor.close()
            conn.close()

    def _store_enhanced_score(
        self,
        resume_id: str,
        job_id: str,
        application_id: str,
        score: int,
        explanation: str,
        skill_analysis: Dict,
        job_context: Dict,
        scoring_result: Dict = None,
    ):
        """
        Store enhanced scoring result in the database
        """
        conn = get_connection()
        cursor = conn.cursor()

        try:
            # Delete any existing score for this application
            cursor.execute(
                """
                DELETE FROM cv_scores WHERE "applicationId" = %s
            """,
                (application_id,),
            )

            # Generate a unique ID for the score record
            score_id = f"cvs_{uuid.uuid4().hex[:20]}"

            # Prepare comprehensive explanation including AI analysis
            comprehensive_explanation = {
                "summary": explanation,
                "aiAnalysis": (
                    scoring_result.get("detailed_analysis", {})
                    if scoring_result
                    else {}
                ),
                "scores": {
                    "overall": score,
                    "skills": (
                        scoring_result.get("skills_score", 0) if scoring_result else 0
                    ),
                    "experience": (
                        scoring_result.get("experience_score", 0)
                        if scoring_result
                        else 0
                    ),
                    "education": (
                        scoring_result.get("education_score", 0)
                        if scoring_result
                        else 0
                    ),
                    "fit": scoring_result.get("fit_score", 0) if scoring_result else 0,
                },
                "recommendation": (
                    scoring_result.get("recommendation", "CONSIDER")
                    if scoring_result
                    else "CONSIDER"
                ),
            }

            # Insert new score
            cursor.execute(
                """
                INSERT INTO cv_scores (id, "resumeId", "jobId", "applicationId", score, explanation, "skillsMatch", requirements)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
                (
                    score_id,
                    resume_id,
                    job_id,
                    application_id,
                    score,
                    json.dumps(comprehensive_explanation),
                    json.dumps(skill_analysis),
                    json.dumps(
                        {
                            "jobTitle": job_context["title"],
                            "company": job_context.get("company"),
                            "location": job_context.get("location"),
                            "requiredSkills": [
                                s["name"]
                                for s in job_context["skills"]
                                if s["required"]
                            ],
                            "preferredSkills": [
                                s["name"]
                                for s in job_context["skills"]
                                if not s["required"]
                            ],
                        }
                    ),
                ),
            )

            conn.commit()
            print(f"[SUCCESS] Stored enhanced score for application {application_id}")

        except Exception as e:
            conn.rollback()
            print(f"[ERROR] Error storing enhanced score: {e}")
            raise e
        finally:
            cursor.close()
            conn.close()

    def score_resume_against_job(self, resume_id: str, job_id: str) -> Dict[str, Any]:
        """
        Score a resume against a job (without application context)
        """
        try:
            print(f"[INFO] Scoring resume {resume_id} against job {job_id}")

            # Get comprehensive context
            job_context = self.get_comprehensive_job_context(job_id)
            resume_context = self.get_resume_context(resume_id)

            # Create enhanced job description
            enhanced_job_description = self.create_enhanced_job_description(job_context)

            # Perform skill matching analysis
            skill_analysis = self.analyze_skill_matching(resume_context, job_context)

            # Use existing scorer with enhanced description (without resume_id to prevent unwanted DB insertion)
            scoring_result = score_single_resume(
                resume_data={
                    "name": resume_context.get("name"),
                    "email": resume_context.get("email"),
                    "skills": resume_context.get("skills", []),
                    "experience": resume_context.get("experience", []),
                    "projects": resume_context.get("projects", []),
                    "certifications": resume_context.get("certifications", []),
                    "summary": resume_context.get("summary"),
                    "experienceYears": resume_context.get("experienceYears"),
                },
                job_description=enhanced_job_description,
                resume_id=None,  # Don't pass resume_id to prevent database insertion
            )

            return {
                "success": True,
                "score": scoring_result.get("overall_score", 0),
                "explanation": scoring_result.get("summary", ""),
                "skillAnalysis": skill_analysis,
                "scoringDetails": scoring_result,
            }

        except Exception as e:
            print(f"[ERROR] Error scoring resume against job: {e}")
            return {"success": False, "error": str(e)}


def main():
    """Command line interface for testing."""
    import argparse

    parser = argparse.ArgumentParser(description="Enhanced AI Resume Scoring Service")
    parser.add_argument("--application-id", help="Application ID to score")
    parser.add_argument("--resume-id", help="Resume ID for direct scoring")
    parser.add_argument("--job-id", help="Job ID for direct scoring")

    args = parser.parse_args()

    service = EnhancedScoringService()

    if args.application_id:
        result = service.score_application(args.application_id)
    elif args.resume_id and args.job_id:
        result = service.score_resume_against_job(args.resume_id, args.job_id)
    else:
        print("Please provide either --application-id or both --resume-id and --job-id")
        return

    print("\n" + "=" * 50)
    print("FINAL RESULT:")
    print(json.dumps(result, indent=2, default=str))


if __name__ == "__main__":
    main()
