import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path

import psycopg


BASE_DIR = Path(__file__).resolve().parent
SQLITE_PATH = BASE_DIR / "portfolio.db"


def _database_url() -> str | None:
    return os.getenv("DATABASE_URL")


def _is_postgres() -> bool:
    return bool(_database_url())


@contextmanager
def get_conn():
    db_url = _database_url()
    if db_url:
        conn = psycopg.connect(db_url)
        try:
            yield conn
        finally:
            conn.close()
    else:
        conn = sqlite3.connect(SQLITE_PATH)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()


def _q(postgres_sql: str, sqlite_sql: str) -> str:
    return postgres_sql if _is_postgres() else sqlite_sql


def init_db() -> None:
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(
            _q(
                """
                CREATE TABLE IF NOT EXISTS contacts (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS contacts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    message TEXT NOT NULL,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """,
            )
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS stats (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
            """
        )
        cur.execute(
            _q(
                "INSERT INTO stats (key, value) VALUES (%s, %s) ON CONFLICT (key) DO NOTHING",
                "INSERT OR IGNORE INTO stats (key, value) VALUES (?, ?)",
            ),
            ("visitors", "0"),
        )
        conn.commit()


def save_contact(name: str, email: str, message: str) -> None:
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(
            _q(
                "INSERT INTO contacts (name, email, message) VALUES (%s, %s, %s)",
                "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)",
            ),
            (name, email, message),
        )
        conn.commit()


def fetch_contacts() -> list[dict]:
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute("SELECT name, email, message, created_at FROM contacts ORDER BY created_at DESC")
        rows = cur.fetchall()
        result = []
        for row in rows:
            if isinstance(row, sqlite3.Row):
                result.append(
                    {
                        "name": row["name"],
                        "email": row["email"],
                        "message": row["message"],
                        "created_at": row["created_at"],
                    }
                )
            else:
                result.append(
                    {
                        "name": row[0],
                        "email": row[1],
                        "message": row[2],
                        "created_at": str(row[3]),
                    }
                )
        return result


def increment_visitors() -> int:
    with get_conn() as conn:
        cur = conn.cursor()
        if _is_postgres():
            cur.execute(
                """
                UPDATE stats
                SET value = (COALESCE(value, '0')::int + 1)::text
                WHERE key = %s
                RETURNING value
                """,
                ("visitors",),
            )
            row = cur.fetchone()
            conn.commit()
            return int(row[0]) if row else 0
        cur.execute("SELECT value FROM stats WHERE key = ?", ("visitors",))
        row = cur.fetchone()
        current = int(row["value"] if row else "0")
        new_value = current + 1
        cur.execute("UPDATE stats SET value = ? WHERE key = ?", (str(new_value), "visitors"))
        conn.commit()
        return new_value


def get_visitors() -> int:
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(
            _q("SELECT value FROM stats WHERE key = %s", "SELECT value FROM stats WHERE key = ?"),
            ("visitors",),
        )
        row = cur.fetchone()
        if not row:
            return 0
        if isinstance(row, sqlite3.Row):
            return int(row["value"])
        return int(row[0])
