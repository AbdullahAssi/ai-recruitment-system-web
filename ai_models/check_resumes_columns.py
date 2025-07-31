#!/usr/bin/env python3

from db import get_connection
import psycopg2.extras


def check_resumes_columns():
    conn = get_connection()
    if not conn:
        print("Could not connect to database")
        return

    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'resumes'"
        )
        columns = cursor.fetchall()

        print("Columns in resumes table:")
        for column in columns:
            print(f"  {column['column_name']} ({column['data_type']})")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    check_resumes_columns()
