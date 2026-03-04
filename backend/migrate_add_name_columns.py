"""
Migration: Add first_name and last_name columns to users table
Run from the backend/ directory:
    python migrate_add_name_columns.py
"""

import sys
import os

# Allow imports from app/
sys.path.insert(0, os.path.dirname(__file__))

from app.config import settings
from sqlalchemy import create_engine, text

engine = create_engine(settings.DATABASE_URL)

COLUMNS = [
    ("first_name", "VARCHAR"),
    ("last_name",  "VARCHAR"),
]


def column_exists(conn, table: str, column: str) -> bool:
    result = conn.execute(
        text(
            """
            SELECT 1
            FROM information_schema.columns
            WHERE table_name   = :table
              AND column_name  = :column
            """
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

    print("\nMigration complete.")


if __name__ == "__main__":
    print("Running migration: add first_name & last_name to users…\n")
    run_migration()
