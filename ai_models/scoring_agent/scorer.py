"""
AI Resume Scoring Agent
Uses OpenAI GPT to score resumes against job descriptions
"""

import os
import sys
import json
import openai
from pathlib import Path

# Add parent directory to path for imports
current_dir = Path(__file__).parent
sys.path.append(str(current_dir.parent))

from db import get_connection, insert_cv_score


def safe_log(message):
    """Safe logging function for Windows console"""
    try:
        print(f"[SCORER] {message}")
    except UnicodeEncodeError:
        print(f"[SCORER] {message.encode('ascii', 'replace').decode('ascii')}")


def score_single_resume(resume_data, job_description, resume_id=None):
    """
    Score a single resume against a job description using OpenAI

    Args:
        resume_data: Dictionary containing extracted resume information
        job_description: String containing the job description
        resume_id: Optional resume ID for database updates

    Returns:
        Dictionary containing score and analysis
    """
    try:
        safe_log("Starting resume scoring process")

        # Initialize OpenAI API key
        openai.api_key = os.getenv("OPENAI_API_KEY")

        # Prepare prompt for scoring
        scoring_prompt = f"""
        You are an expert HR recruiter tasked with scoring a resume against a job description.
        
        JOB DESCRIPTION:
        {job_description}
        
        RESUME DATA:
        {json.dumps(resume_data, indent=2)}
        
        Please analyze this resume and provide a detailed scoring based on the following criteria:
        
        1. Skills Match (0-25 points): How well do the candidate's technical and soft skills match the job requirements?
        2. Experience Match (0-25 points): How relevant is the candidate's work experience to the job role?
        3. Education Match (0-20 points): How well does the candidate's educational background align with job requirements?
        4. Overall Fit (0-30 points): General assessment of how well the candidate would fit this role.
        
        Provide your response in the following JSON format:
        {{
            "overall_score": <total score out of 100>,
            "skills_score": <score out of 25>,
            "experience_score": <score out of 25>,
            "education_score": <score out of 20>,
            "fit_score": <score out of 30>,
            "detailed_analysis": {{
                "strengths": ["list of candidate strengths relevant to the job"],
                "weaknesses": ["list of areas where candidate may fall short"],
                "key_matches": ["specific skills/experiences that match job requirements"],
                "missing_requirements": ["important job requirements not met by candidate"]
            }},
            "recommendation": "HIGHLY_RECOMMENDED|RECOMMENDED|CONSIDER|NOT_RECOMMENDED",
            "summary": "Brief 2-3 sentence summary of the assessment"
        }}
        
        Be objective and thorough in your analysis.
        """

        safe_log("Sending request to OpenAI for scoring")

        # Make API call to OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert HR recruiter with years of experience in matching candidates to job requirements. Provide detailed, objective analysis.",
                },
                {"role": "user", "content": scoring_prompt},
            ],
            max_tokens=1500,
            temperature=0.3,
        )

        # Parse the response
        response_text = response.choices[0].message.content.strip()
        safe_log(f"Received response from OpenAI: {len(response_text)} characters")

        try:
            # Clean the response text by removing markdown code blocks and extra formatting
            clean_response = response_text.strip()

            # Handle markdown code blocks
            if "```json" in clean_response:
                start_marker = "```json"
                end_marker = "```"
                start_idx = clean_response.find(start_marker)
                if start_idx != -1:
                    start_idx += len(start_marker)
                    end_idx = clean_response.find(end_marker, start_idx)
                    if end_idx != -1:
                        clean_response = clean_response[start_idx:end_idx].strip()
            elif "```" in clean_response:
                # Handle generic code blocks
                start_marker = "```"
                end_marker = "```"
                start_idx = clean_response.find(start_marker)
                if start_idx != -1:
                    start_idx += len(start_marker)
                    end_idx = clean_response.find(end_marker, start_idx)
                    if end_idx != -1:
                        clean_response = clean_response[start_idx:end_idx].strip()

            # Find JSON object boundaries
            json_start = clean_response.find("{")
            json_end = clean_response.rfind("}")

            if json_start != -1 and json_end != -1 and json_end > json_start:
                clean_response = clean_response[json_start : json_end + 1]

            safe_log(f"Cleaned response for JSON parsing: {clean_response[:200]}...")

            # Try to parse as JSON
            scoring_result = json.loads(clean_response)
        except json.JSONDecodeError as e:
            safe_log(f"WARNING: Could not parse response as JSON: {str(e)}")
            safe_log(f"Raw response: {response_text}")
            safe_log(
                f"Cleaned response: {clean_response if 'clean_response' in locals() else 'Not cleaned'}"
            )

            # Fallback scoring if JSON parsing fails
            scoring_result = {
                "overall_score": 50,
                "skills_score": 12,
                "experience_score": 12,
                "education_score": 10,
                "fit_score": 16,
                "detailed_analysis": {
                    "strengths": ["Unable to parse detailed analysis"],
                    "weaknesses": ["Response parsing failed"],
                    "key_matches": [],
                    "missing_requirements": [],
                },
                "recommendation": "CONSIDER",
                "summary": "Scoring completed but detailed analysis unavailable due to response parsing error",
                "raw_response": response_text,
            }

        # Store result in database if resume_id provided
        if resume_id:
            try:
                safe_log(f"Storing score in database for resume ID: {resume_id}")
                insert_cv_score(
                    resume_id,
                    None,  # job_id - not available in this context
                    scoring_result["overall_score"],
                    json.dumps(scoring_result["detailed_analysis"]),
                    overall_score=scoring_result["overall_score"],
                    skills_score=scoring_result["skills_score"],
                    experience_score=scoring_result["experience_score"],
                    education_score=scoring_result["education_score"],
                    fit_score=scoring_result["fit_score"],
                    detailed_analysis=scoring_result["detailed_analysis"],
                    recommendation=scoring_result["recommendation"],
                    summary=scoring_result["summary"],
                )
                safe_log("[SUCCESS] Scoring result saved to database")
            except Exception as db_error:
                safe_log(f"[ERROR] Failed to save score to database: {db_error}")

        safe_log(
            f"[SUCCESS] Resume scoring completed. Overall score: {scoring_result['overall_score']}/100"
        )
        return scoring_result

    except Exception as e:
        safe_log(f"[ERROR] Scoring failed: {str(e)}")
        # Return minimal fallback result
        fallback_result = {
            "overall_score": 0,
            "skills_score": 0,
            "experience_score": 0,
            "education_score": 0,
            "fit_score": 0,
            "detailed_analysis": {
                "strengths": [],
                "weaknesses": ["Scoring process failed"],
                "key_matches": [],
                "missing_requirements": [],
            },
            "recommendation": "NOT_RECOMMENDED",
            "summary": f"Scoring failed due to error: {str(e)}",
            "error": str(e),
        }
        return fallback_result


def score_multiple_resumes(resumes_data, job_description):
    """
    Score multiple resumes against a job description

    Args:
        resumes_data: List of resume data dictionaries
        job_description: String containing the job description

    Returns:
        List of scoring results
    """
    results = []

    for i, resume_data in enumerate(resumes_data):
        safe_log(f"Scoring resume {i+1} of {len(resumes_data)}")
        result = score_single_resume(resume_data, job_description)
        result["resume_index"] = i
        results.append(result)

    # Sort by overall score (descending)
    results.sort(key=lambda x: x["overall_score"], reverse=True)

    safe_log(f"[SUCCESS] Completed scoring {len(results)} resumes")
    return results


def test_scoring():
    """Test the scoring functionality"""
    # Sample data for testing
    sample_resume = {
        "name": "John Doe",
        "email": "john.doe@email.com",
        "phone": "+1234567890",
        "skills": ["Python", "JavaScript", "React", "Node.js", "SQL"],
        "experience": [
            {
                "title": "Software Developer",
                "company": "Tech Corp",
                "duration": "2 years",
                "description": "Developed web applications using React and Node.js",
            }
        ],
        "education": [
            {
                "degree": "Bachelor of Computer Science",
                "institution": "University XYZ",
                "year": "2022",
            }
        ],
    }

    sample_job_description = """
    Software Developer Position
    
    We are looking for a skilled Software Developer with experience in:
    - Python programming
    - Web development with React
    - Database management with SQL
    - 2+ years of experience in software development
    
    Requirements:
    - Bachelor's degree in Computer Science or related field
    - Strong problem-solving skills
    - Experience with modern web technologies
    """

    try:
        result = score_single_resume(sample_resume, sample_job_description)
        safe_log("Test scoring completed successfully")
        safe_log(f"Sample score: {result['overall_score']}/100")
        return result
    except Exception as e:
        safe_log(f"Test scoring failed: {e}")
        return None


if __name__ == "__main__":
    test_scoring()
