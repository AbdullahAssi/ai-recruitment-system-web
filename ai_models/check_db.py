from db import get_connection
import json

conn = get_connection()
cursor = conn.cursor()

cursor.execute(
    """
    SELECT name, email, linkedin, github, skills_json, projects_json, certifications_json 
    FROM resumes 
    ORDER BY "uploadDate" DESC 
    LIMIT 1
"""
)

row = cursor.fetchone()

if row:
    print("✅ Database verification:")
    print("Name:", row[0])
    print("Email:", row[1])
    print("LinkedIn:", row[2])
    print("GitHub:", row[3])

    skills = json.loads(row[4]) if row[4] else []
    print("Skills count:", len(skills))
    print("Skills:", skills[:5], "..." if len(skills) > 5 else "")

    projects = json.loads(row[5]) if row[5] else []
    print("Projects count:", len(projects))
    for i, project in enumerate(projects[:3]):
        print(f"  Project {i+1}: {project[:50]}...")

    certifications = json.loads(row[6]) if row[6] else []
    print("Certifications count:", len(certifications))
    for i, cert in enumerate(certifications[:3]):
        print(f"  Cert {i+1}: {cert}")
else:
    print("No resume found")

conn.close()
