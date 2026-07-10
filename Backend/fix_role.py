import sqlite3
import os

db_files = ["ai_interview.db", "interview.db"]

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

    print("Tables:", tables)

    table_names = [table[0] for table in tables]

    if "users" not in table_names:
        print("users table not found in", db_file)
        conn.close()
        continue

    columns = cur.execute("PRAGMA table_info(users)").fetchall()
    column_names = [column[1] for column in columns]

    print("User columns:", column_names)

    if "role" not in column_names:
        cur.execute(
            "ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'student' NOT NULL"
        )
        conn.commit()
        print("role column added in", db_file)
    else:
        print("role column already exists in", db_file)

    conn.close()

print("\nDone")