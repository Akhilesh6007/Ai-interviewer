import sqlite3
import os

db_files = ["ai_interview.db", "interview.db"]

required_columns = {
    "drive_id": "INTEGER",
    "total_questions": "INTEGER DEFAULT 5",
}

for db_file in db_files:
    if not os.path.exists(db_file):
        print(db_file, "not found")
        continue

    print("\nChecking:", db_file)

    conn = sqlite3.connect(db_file)
    cur = conn.cursor()

    tables = cur.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()

    table_names = [table[0] for table in tables]

    if "interview_sessions" not in table_names:
        print("interview_sessions table not found in", db_file)
        conn.close()
        continue

    columns = cur.execute("PRAGMA table_info(interview_sessions)").fetchall()
    column_names = [column[1] for column in columns]

    print("Existing columns:", column_names)

    for column_name, column_type in required_columns.items():
        if column_name not in column_names:
            cur.execute(
                f"ALTER TABLE interview_sessions ADD COLUMN {column_name} {column_type}"
            )
            conn.commit()
            print(f"{column_name} column added in {db_file}")
        else:
            print(f"{column_name} already exists in {db_file}")

    conn.close()

print("\nDone")