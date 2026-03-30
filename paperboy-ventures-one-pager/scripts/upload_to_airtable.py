#!/usr/bin/env python3
"""
Step 4: Upload the generated PDF to Supabase Storage, get a signed URL,
then PATCH the Airtable record's Attachment field with that URL.

Airtable downloads the file from the signed URL immediately on PATCH,
so a 1-hour expiry is more than sufficient.

Usage:
    python3 upload_to_airtable.py \
      --pdf .tmp/Acme_one_pager.pdf \
      --record-id recXXXXXXXXX
"""

import argparse
import os
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()
load_dotenv(".env.local", override=True)  # Next.js convention

_REQUIRED_ENV = ["AIRTABLE_API_KEY", "AIRTABLE_BASE_ID", "AIRTABLE_TABLE_NAME", "AIRTABLE_PDF_FIELD"]
_missing = [k for k in _REQUIRED_ENV if not os.environ.get(k)]
if _missing:
    print(f"ERROR: Missing required environment variables: {', '.join(_missing)}", file=sys.stderr)
    sys.exit(1)

AIRTABLE_API_KEY = os.environ["AIRTABLE_API_KEY"]
AIRTABLE_BASE_ID = os.environ["AIRTABLE_BASE_ID"]
AIRTABLE_TABLE_NAME = os.environ["AIRTABLE_TABLE_NAME"]
AIRTABLE_PDF_FIELD = os.environ["AIRTABLE_PDF_FIELD"]

AIRTABLE_BASE_URL = "https://api.airtable.com/v0"

SUPABASE_URL = (
    os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL", "")
).rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# Bucket must exist in Supabase Storage (create it as private in the dashboard)
SUPABASE_BUCKET = "one-pagers"


def upload_to_supabase(record_id: str, pdf_path: Path) -> str:
    """
    Upload PDF to Supabase Storage and return a permanent public URL.
    Requires the 'one-pagers' bucket to be set to Public in Supabase Storage.
    Public URLs have no JWT / expiry — Airtable can always fetch them.
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError(
            "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local"
        )

    storage_path = f"{record_id}.pdf"
    auth_headers = {"Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"}

    # Upload (upsert so re-runs overwrite)
    upload_url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{storage_path}"
    resp = requests.post(
        upload_url,
        headers={**auth_headers, "Content-Type": "application/pdf", "x-upsert": "true"},
        data=pdf_path.read_bytes(),
        timeout=60,
    )
    if resp.status_code not in (200, 201):
        raise RuntimeError(
            f"Supabase upload failed ({resp.status_code}): {resp.text[:300]}\n"
            f"Make sure the '{SUPABASE_BUCKET}' bucket exists and is set to Public."
        )

    # Return permanent public URL — no JWT, no expiry, Airtable can always access it
    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{storage_path}"
    return public_url


def patch_attachment_field(record_id: str, url_value: str) -> None:
    """PATCH the Attachment field on the Airtable record with the PDF URL."""
    endpoint = f"{AIRTABLE_BASE_URL}/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_NAME}/{record_id}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json",
    }
    body = {"fields": {AIRTABLE_PDF_FIELD: [{"url": url_value}]}}

    resp = requests.patch(endpoint, headers=headers, json=body, timeout=30)
    if resp.status_code != 200:
        print(f"  PATCH response {resp.status_code}: {resp.text[:500]}", file=sys.stderr)
        raise RuntimeError(f"Airtable PATCH failed ({resp.status_code}): {resp.text[:200]}")
    # Log the returned attachment to confirm Airtable accepted it
    try:
        updated = resp.json().get("fields", {}).get(AIRTABLE_PDF_FIELD)
        print(f"  Airtable field after PATCH: {updated}")
    except Exception:
        pass


def main():
    parser = argparse.ArgumentParser(description="Upload PDF to Supabase and attach to Airtable record")
    parser.add_argument("--pdf", required=True, help="Path to the PDF file")
    parser.add_argument("--record-id", required=True, help="Airtable record ID (recXXX...)")
    args = parser.parse_args()

    pdf_path = Path(args.pdf)
    if not pdf_path.exists():
        print(f"ERROR: PDF not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)

    record_id = args.record_id
    print(f"Uploading {pdf_path.name} → Airtable record {record_id}")

    try:
        print("  Uploading to Supabase Storage...")
        hosted_url = upload_to_supabase(record_id, pdf_path)
        print(f"  Hosted URL: {hosted_url}")

        print(f"  Attaching to Airtable field '{AIRTABLE_PDF_FIELD}'...")
        patch_attachment_field(record_id, hosted_url)

    except RuntimeError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"Done — record {record_id} field '{AIRTABLE_PDF_FIELD}' updated.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
