#!/usr/bin/env python3

from db import get_connection
import psycopg2.extras


def check_tables():
    conn = get_connection()
    if not conn:
        print("Could not connect to database")
        return

    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        )
        tables = cursor.fetchall()

        print("Tables in database:")
        for table in tables:
            print(f"  {table['table_name']}")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    check_tables()
