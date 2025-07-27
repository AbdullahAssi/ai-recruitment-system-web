import os
from flask import Flask, render_template, request, redirect, url_for, flash
import json
from werkzeug.utils import secure_filename
from prisma import Prisma

# Import your extraction & DB functions
from main import extract_cv_info  # your existing CV parsing function
from db import create_tables as create_table, insert_resume, read_cv_file  # your existing DB funcs

app = Flask(__name__)
app.secret_key = "your_secret_key"  # Needed for flash messages

UPLOAD_FOLDER = "data"
ALLOWED_EXTENSIONS = {"txt"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Initialize Prisma client
prisma = Prisma()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.before_first_request
def connect_prisma():
    try:
        prisma.connect()
        app.logger.info("Connected to Prisma database successfully.")
    except Exception as e:
        app.logger.error(f"Failed to connect to Prisma database: {e}")

# Replace fetch_all_resumes to use Prisma
async def fetch_all_resumes():
    resumes = await prisma.resumes.find_many()
    return [
        {
            "filename": resume.filename,
            "name": resume.name,
            "email": resume.email,
            "linkedin": resume.linkedin,
            "github": resume.github,
            "skills": json.loads(resume.skills_json),
            "experience": json.loads(resume.experience_json),
            "projects": json.loads(resume.projects_json),
            "certifications": json.loads(resume.certifications_json),
            "evaluation": json.loads(resume.evaluation_json) if resume.evaluation_json else None
        }
        for resume in resumes
    ]

@app.route("/", methods=["GET", "POST"])
def index():
    create_table()  # Ensure table exists

    if request.method == "POST":
        if "file" not in request.files:
            flash("No file part")
            return redirect(request.url)

        file = request.files["file"]
        if file.filename == "":
            flash("No selected file")
            return redirect(request.url)

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
            save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            file.save(save_path)

            # Read file text and parse
            cv_text = read_cv_file(save_path)
            try:
                extracted_json_str = extract_cv_info(cv_text)
                parsed_json = json.loads(extracted_json_str)
                insert_resume(filename, parsed_json)
                flash(f"Successfully uploaded and parsed {filename}")
            except Exception as e:
                flash(f"Error parsing file: {e}")

            return redirect(url_for("index"))
        else:
            flash("Allowed file type is .txt")
            return redirect(request.url)

    resumes = fetch_all_resumes()
    return render_template("index.html", resumes=resumes)

if __name__ == "__main__":
    app.run(debug=True)
