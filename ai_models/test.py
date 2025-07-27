import sqlite3

conn = sqlite3.connect("parsed_cvs.db")
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE resumes ADD COLUMN evaluation_json TEXT;")
    conn.commit()
    print("✅ Column 'evaluation_json' added successfully.")
except sqlite3.OperationalError as e:
    print(f"⚠️ Warning: {e}")
finally:
    conn.close()
