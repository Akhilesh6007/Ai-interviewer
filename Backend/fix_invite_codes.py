import sqlite3
import uuid
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

    table_names = [table[0] for table in tables]

    if "hiring_drives" not in table_names:
        print("hiring_drives table not found in", db_file)
        conn.close()
        continue

    columns = cur.execute("PRAGMA table_info(hiring_drives)").fetchall()
    column_names = [column[1] for column in columns]

    if "invite_code" not in column_names:
        cur.execute("ALTER TABLE hiring_drives ADD COLUMN invite_code VARCHAR")
        conn.commit()
        print("invite_code column added in", db_file)

    drives = cur.execute(
        "SELECT id, invite_code FROM hiring_drives"
    ).fetchall()

    for drive_id, invite_code in drives:
        if invite_code is None or invite_code == "":
            new_code = str(uuid.uuid4())[:8]
            cur.execute(
                "UPDATE hiring_drives SET invite_code = ? WHERE id = ?",
                (new_code, drive_id)
            )
            print(f"Drive {drive_id} updated with invite code: {new_code}")

    conn.commit()
    conn.close()

print("\nDone")