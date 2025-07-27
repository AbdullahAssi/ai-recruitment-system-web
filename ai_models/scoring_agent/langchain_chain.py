from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import sqlite3
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup LLM and prompt with API key from environment
llm = ChatOpenAI(
    temperature=0.2, model="gpt-3.5-turbo", openai_api_key=os.getenv("OPENAI_API_KEY")
)

prompt_template = PromptTemplate(
    input_variables=["job_description", "resume", "knowledge"],
    template="""
You are a resume evaluator. Given a Job Description (JD), a candidate's resume, and optional domain knowledge,
assign a relevance score from 0 to 100, and provide a brief explanation (2–3 sentences) of the score.

Job Description:
{job_description}

Domain Knowledge:
{knowledge}

Candidate Resume:
{resume}

Respond strictly in this JSON format (no extra text):
{{
  "score": <0-100>,
  "explanation": "<short paragraph explaining how well the resume matches the JD>"
}}
""",
)


def get_scoring_chain():
    return LLMChain(llm=llm, prompt=prompt_template)


# Example DB save function (adjust db_path as needed)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(BASE_DIR, "..", "parsed_cvs.db")  # adjust path accordingly


def save_score(resume_id, job_description, score, explanation, db_path=DB_NAME):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS cv_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resume_id INTEGER,
            job_description TEXT,
            score INTEGER,
            explanation TEXT,
            scored_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """
    )
    cursor.execute(
        """
        INSERT INTO cv_scores (resume_id, job_description, score, explanation)
        VALUES (?, ?, ?, ?)
    """,
        (resume_id, job_description, score, explanation),
    )
    conn.commit()
    conn.close()
