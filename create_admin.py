#!/usr/bin/env python3
"""
Admin Account Creation Script
Run inside the backend container:
  docker exec -it <backend_container> python create_admin.py

Or with custom credentials:
  docker exec -it <backend_container> python create_admin.py \
      --email admin@visionflow.ai --password MyStr0ngPass!
"""
import asyncio
import argparse
import os
import sys

from prisma import Prisma


async def create_admin(email: str, password: str, first_name: str, last_name: str):
    db = Prisma()
    await db.connect()

    try:
        # Check existing
        existing = await db.user.find_unique(where={"email": email})
        if existing:
            if existing.role == "ADMIN":
                print(f"[!] Admin with email '{email}' already exists (id={existing.id}).")
            else:
                # Upgrade existing user to ADMIN
                updated = await db.user.update(
                    where={"id": existing.id},
                    data={"role": "ADMIN"},
                )
                print(f"[+] Existing user '{email}' upgraded to ADMIN (id={updated.id}).")
            return

        user = await db.user.create(
            data={
                "firstName": first_name,
                "lastName": last_name,
                "email": email,
                "password": password,
                "role": "ADMIN",
            }
        )
        print(f"[+] Admin account created successfully!")
        print(f"    ID    : {user.id}")
        print(f"    Name  : {user.firstName} {user.lastName}")
        print(f"    Email : {user.email}")
        print(f"    Role  : {user.role}")
    finally:
        await db.disconnect()


def main():
    parser = argparse.ArgumentParser(description="Create or promote an admin account")
    parser.add_argument(
        "--email",
        default=os.getenv("ADMIN_EMAIL", "admin@visionflow.ai"),
        help="Admin email address",
    )
    parser.add_argument(
        "--password",
        default=os.getenv("ADMIN_PASSWORD", "Admin@1234"),
        help="Admin password (plain text, stored as-is)",
    )
    parser.add_argument("--first-name", default="Super", help="First name")
    parser.add_argument("--last-name",  default="Admin",  help="Last name")

    args = parser.parse_args()

    print(f"[*] Connecting to database…")
    print(f"[*] Creating admin: {args.email}")

    asyncio.run(create_admin(
        email=args.email,
        password=args.password,
        first_name=args.first_name,
        last_name=args.last_name,
    ))


if __name__ == "__main__":
    main()
