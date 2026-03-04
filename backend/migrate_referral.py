"""
Migration: Add referral_code and max_decisions to users table
Run from the backend/ directory:
    python migrate_referral.py
"""

import sys
import os
import random
import string

# Allow imports from app/
sys.path.insert(0, os.path.dirname(__file__))

from app.config import settings
from sqlalchemy import create_engine, text

engine = create_engine(settings.DATABASE_URL)

COLUMNS = [
    ("referral_code", "VARCHAR"),
    ("max_decisions", "INTEGER"),
]

def column_exists(conn, table: str, column: str) -> bool:
    result = conn.execute(
        text(
            "SELECT 1 FROM information_schema.columns WHERE table_name = :table AND column_name = :column"
        ),
        {"table": table, "column": column},
    )
    return result.fetchone() is not None

def run_migration():
    with engine.begin() as conn:
        for col_name, col_type in COLUMNS:
            if column_exists(conn, "users", col_name):
                print(f"  ✓ Column '{col_name}' already exists — skipping.")
            else:
                conn.execute(
                    text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type} NULL")
                )
                print(f"  ✅ Column '{col_name}' added successfully.")
        
        # Populate existing users
        users = conn.execute(text("SELECT id, referral_code, max_decisions FROM users")).fetchall()
        for user in users:
            updates = []
            params = {"user_id": user[0]}
            if user[1] is None:
                ref_code = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
                updates.append("referral_code = :ref_code")
                params["ref_code"] = ref_code
            if user[2] is None:
                updates.append("max_decisions = :max_dec")
                params["max_dec"] = 5
            
            if updates:
                conn.execute(
                    text(f"UPDATE users SET {', '.join(updates)} WHERE id = :user_id"),
                    params
                )
        
        print("  ✅ Existing users updated with default values.")

    print("\nMigration complete.")

if __name__ == "__main__":
    print("Running migration: add referral_code & max_decisions to users...\n")
    run_migration()
