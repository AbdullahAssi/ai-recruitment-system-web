from db import get_connection

try:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT id, "fileName", "filePath" FROM "Resumes" ORDER BY "uploadDate" DESC LIMIT 5'
    )
    results = cursor.fetchall()
    print("Recent resumes:")
    for r in results:
        print(f"ID: {r[0]}, File: {r[1]}, Path: {r[2]}")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
