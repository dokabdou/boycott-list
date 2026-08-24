#!/usr/bin/env python3
"""
Migrate MongoDB data (from mongoexport JSON files) to PostgreSQL.
Reads one JSON object per line and creates the necessary tables first.
"""
import os
import json
import sys
from datetime import datetime

import psycopg2
from psycopg2.extras import Json

# Load env vars from .env if possible
try:
    from dotenv import load_dotenv
    PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    load_dotenv(os.path.join(PROJECT_ROOT, '.env'))
except ImportError:
    pass

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "devdb")
DB_USER = os.getenv("DB_USERNAME", "dev")
DB_PASSWORD = os.getenv("DB_PASSWORD", "dev")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DUMP_DIR = os.getenv("DUMP_DIR", os.path.join(SCRIPT_DIR, "..", "backup_db", "clientdb"))

def load_json(collection_name):
    filepath = os.path.join(DUMP_DIR, f"{collection_name}.json")
    if not os.path.exists(filepath):
        print(f"Warning: {filepath} not found, skipping.")
        return []
    docs = []
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                docs.append(json.loads(line))
    print(f"Loaded {len(docs)} documents from {collection_name}.json")
    return docs

def extract_category_name(cat):
    if isinstance(cat, str):
        return cat
    elif isinstance(cat, dict):
        return cat.get('name') or cat.get('$oid')
    return None

def extract_tags(tags):
    result = []
    if isinstance(tags, list):
        for t in tags:
            if isinstance(t, str):
                result.append(t)
            elif isinstance(t, dict):
                name = t.get('name') or t.get('$oid')
                if name:
                    result.append(str(name))
    return result

def parse_date(value):
    if isinstance(value, datetime):
        return value
    elif isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace('Z', '+00:00'))
        except:
            return None
    elif isinstance(value, dict):
        date_str = value.get('$date')
        if date_str:
            return parse_date(date_str)
    return None

def get_oid(doc_id):
    if isinstance(doc_id, dict) and '$oid' in doc_id:
        return doc_id['$oid']
    return str(doc_id)

def create_tables(cur):
    cur.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id          VARCHAR(255) PRIMARY KEY,
            name        VARCHAR(255) UNIQUE NOT NULL,
            approved    BOOLEAN NOT NULL DEFAULT true
        );

        CREATE TABLE IF NOT EXISTS tags (
            id          VARCHAR(255) PRIMARY KEY,
            name        VARCHAR(255) UNIQUE NOT NULL,
            approved    BOOLEAN NOT NULL DEFAULT true
        );

        CREATE TABLE IF NOT EXISTS posts (
            id              VARCHAR(255) PRIMARY KEY,
            company_name    VARCHAR(255) NOT NULL,
            category_name   VARCHAR(255),
            description     TEXT,
            submitted_by    VARCHAR(255),
            anonymous       BOOLEAN NOT NULL DEFAULT false,
            status          VARCHAR(50) NOT NULL,
            created_at      TIMESTAMP,
            reviewed_at     TIMESTAMP,
            reviewed_by     VARCHAR(255),
            source_links    JSONB,
            highlights      JSONB,
            tags            JSONB
        );
    """)

def migrate():
    categories = load_json('categories')
    tags = load_json('tags')
    posts = load_json('posts')

    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    cur = conn.cursor()

    try:
        create_tables(cur)

        # Insert categories
        for cat in categories:
            cid = get_oid(cat.get('_id'))
            name = cat.get('name')
            approved = cat.get('approved', True)
            if name:
                cur.execute(
                    "INSERT INTO categories (id, name, approved) VALUES (%s, %s, %s) ON CONFLICT (name) DO UPDATE SET id = EXCLUDED.id",
                    (cid, name, approved)
                )

        # Insert tags
        for tag in tags:
            tid = get_oid(tag.get('_id'))
            name = tag.get('name')
            approved = tag.get('approved', True)
            if name:
                cur.execute(
                    "INSERT INTO tags (id, name, approved) VALUES (%s, %s, %s) ON CONFLICT (name) DO UPDATE SET id = EXCLUDED.id",
                    (tid, name, approved)
                )

        # Insert posts
        for post in posts:
            pid = get_oid(post.get('_id'))
            company_name = post.get('companyName', 'Unknown')
            category_name = extract_category_name(post.get('category'))
            description = post.get('description')
            submitted_by = post.get('submittedBy')
            anonymous = post.get('anonymous', False)
            status = post.get('status', 'PENDING')
            created_at = parse_date(post.get('createdAt'))
            reviewed_at = parse_date(post.get('reviewedAt'))
            reviewed_by = post.get('reviewedBy')

            source_links = post.get('sourceLinks', [])
            if not isinstance(source_links, list):
                source_links = []
            highlights = post.get('highlights', [])
            if not isinstance(highlights, list):
                highlights = []

            tags_list = extract_tags(post.get('tags'))

            cur.execute(
                """
                INSERT INTO posts (
                    id, company_name, category_name, description,
                    submitted_by, anonymous, status, created_at,
                    reviewed_at, reviewed_by, source_links, highlights, tags
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    company_name = EXCLUDED.company_name,
                    category_name = EXCLUDED.category_name,
                    description = EXCLUDED.description,
                    submitted_by = EXCLUDED.submitted_by,
                    anonymous = EXCLUDED.anonymous,
                    status = EXCLUDED.status,
                    created_at = EXCLUDED.created_at,
                    reviewed_at = EXCLUDED.reviewed_at,
                    reviewed_by = EXCLUDED.reviewed_by,
                    source_links = EXCLUDED.source_links,
                    highlights = EXCLUDED.highlights,
                    tags = EXCLUDED.tags
                """,
                (
                    pid, company_name, category_name, description,
                    submitted_by, anonymous, status, created_at,
                    reviewed_at, reviewed_by, Json(source_links), Json(highlights), Json(tags_list)
                )
            )

        conn.commit()
        print("Migration completed successfully.")
    except Exception as e:
        conn.rollback()
        print(f"Error during migration: {e}", file=sys.stderr)
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    migrate()