#!/usr/bin/env python3

from db import get_connection
import psycopg2.extras


def check_cv_scores_data():
    conn = get_connection()
    if not conn:
        print("Could not connect to database")
        return

    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            """
            SELECT cs.*, r.name, r.filename, j.title as job_title, a.id as application_id
            FROM cv_scores cs
            LEFT JOIN resumes r ON cs."resumeId" = r.id
            LEFT JOIN jobs j ON cs."jobId" = j.id
            LEFT JOIN applications a ON cs."applicationId" = a.id
            ORDER BY cs."scoredAt" DESC
            LIMIT 5
        """
        )
        scores = cursor.fetchall()

        print("Recent CV Scores:")
        for score in scores:
            print(f"  Score ID: {score['id']}")
            print(f"  Candidate: {score['name']} ({score['filename']})")
            print(f"  Job: {score['job_title']}")
            print(f"  Score: {score['score']}")
            print(f"  Explanation preview: {str(score['explanation'])[:100]}...")
            print(f"  Skills Match: {str(score['skillsMatch'])[:50]}...")
            print("  ---")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    check_cv_scores_data()
