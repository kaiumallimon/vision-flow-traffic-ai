#!/usr/bin/env python3
"""
Admin Account Creation Script (asyncpg)
Usage:
  python create_admin.py
  python create_admin.py --email admin@example.com --password SecurePass1
"""
import asyncio
import argparse
import os
import sys

import asyncpg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("[!] DATABASE_URL environment variable not set.")
    sys.exit(1)


async def create_admin(email: str, password: str, first_name: str, last_name: str):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        existing = await conn.fetchrow('SELECT id, role FROM "User" WHERE email = $1', email)
        if existing:
            if existing["role"] == "ADMIN":
                print(f"[!] Admin with email '{email}' already exists (id={existing['id']}).")
            else:
                await conn.execute(
                    'UPDATE "User" SET role = $1::\"UserRole\" WHERE id = $2',
                    "ADMIN", existing["id"]
                )
                print(f"[+] Existing user '{email}' upgraded to ADMIN (id={existing['id']}).")
            return

        row = await conn.fetchrow(
            '''
            INSERT INTO "User" ("firstName", "lastName", email, password, role)
            VALUES ($1, $2, $3, $4, $5::"UserRole")
            RETURNING id, "firstName", "lastName", email, role
            ''',
            first_name, last_name, email, password, "ADMIN"
        )
        print(f"[+] Admin account created successfully!")
        print(f"    ID    : {row['id']}")
        print(f"    Name  : {row['firstName']} {row['lastName']}")
        print(f"    Email : {row['email']}")
        print(f"    Role  : {row['role']}")
    finally:
        await conn.close()


def main():
    parser = argparse.ArgumentParser(description="Create or promote an admin account")
    parser.add_argument("--email",      default=os.getenv("ADMIN_EMAIL",    "admin@visionflow.ai"))
    parser.add_argument("--password",   default=os.getenv("ADMIN_PASSWORD", "Admin@1234"))
    parser.add_argument("--first-name", default="Super")
    parser.add_argument("--last-name",  default="Admin")
    args = parser.parse_args()

    print(f"[*] Connecting to database...")
    print(f"[*] Creating admin: {args.email}")
    asyncio.run(create_admin(args.email, args.password, args.first_name, args.last_name))


if __name__ == "__main__":
    main()
