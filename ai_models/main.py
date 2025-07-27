import os
import openai
import json
import re
from dotenv import load_dotenv
from db import create_tables, insert_resume_data
from text_extractor import extract_text_from_file

load_dotenv()  # <-- This loads variables from .env
api_key = os.getenv("OPENAI_API_KEY")
# Don't print API key for security

# Set up OpenAI client with your API key
openai.api_key = api_key


def read_cv_file(file_path):
    """Read CV file and extract text."""
    try:
        # Use the text extractor that supports multiple formats
        text = extract_text_from_file(file_path)
        return text
    except Exception as e:
        print(
            f"[WARNING] Error with advanced extraction, falling back to simple text read: {e}"
        )
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                return file.read()
        except Exception as fallback_error:
            print(f"[ERROR] Fallback text read failed: {fallback_error}")
            return ""


def extract_cv_info(cv_text):
    """Extract structured information from CV text using OpenAI."""
    try:
        prompt = f"""
        Analyze the following CV/Resume text and extract key information in JSON format:

        CV Text:
        {cv_text}

        Please extract and return a JSON object with the following structure:
        {{
            "name": "Full name of the candidate",
            "email": "Email address if found",
            "phone": "Phone number if found",
            "linkedin": "LinkedIn profile URL if found",
            "github": "GitHub profile URL if found",
            "skills": ["skill1", "skill2", "skill3"],
            "experience_years": number_of_years_of_experience,
            "education_level": "highest education level (Bachelor's, Master's, PhD, etc.)",
            "work_experience": ["Company1: Role1", "Company2: Role2"],
            "projects": ["Project1: Brief description", "Project2: Brief description"],
            "certifications": ["Cert1", "Cert2"],
            "summary": "Brief professional summary (max 200 chars)"
        }}

        If any field is not found, use null for strings/objects and 0 for numbers.
        Make sure the response is valid JSON only, no additional text.
        """

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional CV analyzer. Return only valid JSON. Keep descriptions concise to avoid token limits.",
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=1200,
            temperature=0.3,
        )

        result = response.choices[0].message.content.strip()

        # Clean up the response to ensure it's valid JSON
        if result.startswith("```json"):
            result = result[7:]
        if result.endswith("```"):
            result = result[:-3]

        result = result.strip()

        # Try to validate and fix common JSON issues
        try:
            # Validate JSON
            parsed_json = json.loads(result)
            return json.dumps(parsed_json)  # Return clean JSON
        except json.JSONDecodeError as e:
            print(f"[WARNING] JSON parsing error: {e}")
            print(f"[WARNING] Raw response: {result[:500]}...")

            # Try to fix common issues
            try:
                # Fix trailing commas and other common issues
                import re

                # Remove trailing commas before closing brackets/braces
                result = re.sub(r",(\s*[}\]])", r"\1", result)

                # Try parsing again
                parsed_json = json.loads(result)
                return json.dumps(parsed_json)
            except:
                print(f"[ERROR] Could not fix JSON, using default structure")
                raise e

    except Exception as e:
        print(f"[ERROR] Error parsing OpenAI JSON response: {e}")
        # Return a default structure
        return json.dumps(
            {
                "name": "Unknown",
                "email": None,
                "phone": None,
                "linkedin": None,
                "github": None,
                "skills": [],
                "experience_years": 0,
                "education_level": "Unknown",
                "work_experience": [],
                "projects": [],
                "certifications": [],
                "summary": "Could not extract information",
            }
        )


def process_cv_folder(folder_path):
    """Process all CV files in a folder."""
    if not os.path.exists(folder_path):
        print(f"[ERROR] Folder does not exist: {folder_path}")
        return

    # Create tables first
    create_tables()

    # Process each file
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)

        # Skip if it's a directory
        if os.path.isdir(file_path):
            continue

        # Process supported file types
        if filename.lower().endswith((".pdf", ".docx", ".doc", ".txt")):
            print(f"\nProcessing CV: {filename}")
            cv_text = read_cv_file(file_path)
            try:
                result = extract_cv_info(cv_text)
                parsed_json = json.loads(result)  # ensure it's valid

                # Extract data for database insertion
                skills = parsed_json.get("skills", [])
                experience_years = parsed_json.get("experience_years", 0)
                education_level = parsed_json.get("education_level", "Unknown")
                candidate_name = parsed_json.get("name", "Unknown")
                candidate_email = parsed_json.get("email")

                insert_resume_data(
                    filename=filename,
                    file_path=file_path,
                    extracted_text=cv_text,
                    skills=skills,
                    experience_years=experience_years,
                    education_level=education_level,
                    candidate_name=candidate_name,
                    candidate_email=candidate_email,
                )
                print(f"[SUCCESS] Inserted into database: {filename}")
            except Exception as e:
                print(f"[ERROR] Error parsing or inserting {filename}: {e}")


if __name__ == "__main__":
    # Test with a folder of CV files
    cv_folder = "./sample_cvs"  # Change this to your CV folder path
    process_cv_folder(cv_folder)
