---
name: paperboy-ventures-one-pager
description: Generate newspaper-style one-pager PDFs for Paperboy Ventures investment applicants from Airtable. Enriches each application with AI-researched market analysis, competitive landscape, and founder background, then uploads the PDF back to the Airtable record. Use when asked to generate one-pagers, process investment applications, create Paperboy Ventures PDFs, or run the one-pager pipeline.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Paperboy Ventures One-Pager Generator

## Goal
Pull investment applications from Airtable, enrich each one with AI-researched content (market, competition, founder background), render a newspaper-style PDF, and attach it back to the Airtable record.

## Inputs
- Airtable table with applicant records (First Name, Last Name, Email, Company Name, Website, LinkedIn Profile, Message)
- PDF attachment field must be empty (already-processed records are skipped)

## Scripts
- `./scripts/fetch_airtable.py` — Step 1: Pull unprocessed records from Airtable
- `./scripts/research_company.py` — Step 2: Research website + LinkedIn + generate content via Claude
- `./scripts/generate_one_pager.py` — Step 3: Fill HTML template and render PDF via Playwright
- `./scripts/upload_to_airtable.py` — Step 4: Upload PDF and attach to Airtable record

## Process

### 1. Fetch Unprocessed Records
```bash
python3 .claude/skills/paperboy-ventures-one-pager/scripts/fetch_airtable.py \
  --output .tmp/applications.json
```
Outputs `.tmp/applications.json` — array of records missing the PDF attachment.

### 2. Research Each Company (per record)
```bash
python3 .claude/skills/paperboy-ventures-one-pager/scripts/research_company.py \
  --record '{"id":"recXXX","company":"Acme","website":"https://acme.com","linkedin":"https://linkedin.com/in/...","message":"...","first_name":"Jane","last_name":"Doe","email":"jane@acme.com"}' \
  --output .tmp/acme_research.json
```
Outputs `{company_slug}_research.json` with 5 Claude-generated sections:
- `about_brand`, `market_size`, `competitive_landscape`, `founder_background`, `current_traction`

### 3. Generate PDF (per record)
```bash
python3 .claude/skills/paperboy-ventures-one-pager/scripts/generate_one_pager.py \
  --research .tmp/acme_research.json \
  --output .tmp/Acme_one_pager.pdf
```
Fills the HTML template and renders to PDF via Playwright.

### 4. Upload to Airtable (per record)
```bash
python3 .claude/skills/paperboy-ventures-one-pager/scripts/upload_to_airtable.py \
  --pdf .tmp/Acme_one_pager.pdf \
  --record-id recXXXXXXXXX
```
Uploads PDF bytes to Airtable's content API and patches the record's attachment field.

## Orchestration Loop

Run once, processes all unprocessed records:

1. Run `fetch_airtable.py` → load `.tmp/applications.json`
2. For each record in the list:
   - Derive `company_slug` (lowercase, hyphens, e.g. `acme-corp`)
   - Run `research_company.py --record '{...}' --output .tmp/{slug}_research.json`
   - Run `generate_one_pager.py --research .tmp/{slug}_research.json --output .tmp/{CompanyName}_one_pager.pdf`
   - Run `upload_to_airtable.py --pdf .tmp/{CompanyName}_one_pager.pdf --record-id {record_id}`
3. Report: "Generated and uploaded X one-pagers to Airtable"

## Environment
Requires in `.env`:
```
AIRTABLE_API_KEY=          # Personal Access Token
AIRTABLE_BASE_ID=          # From Airtable URL (e.g. app5JTdvWR13ph7wj)
AIRTABLE_TABLE_NAME=       # e.g. "DEALS_BrandApps_8.15.25"
AIRTABLE_PDF_FIELD=        # e.g. "AI One-Pager" (the URL text field)
ANTHROPIC_API_KEY=         # Already required globally
APIFY_API_TOKEN=           # For LinkedIn scraping (optional — skipped if absent)
```

## Actual Table Field Names (DEALS_BrandApps_8.15.25)
Discovered from live table — normalize_record maps these:
- `Company` → `company`
- `Contact Name` → `first_name` + `last_name` (split on first space)
- `Contact Email` → `email`
- `Website` → `website`
- `message` → `message` (lowercase key)
- `AI One-Pager` → URL text field (not an Airtable attachment field)
- No LinkedIn field exists in this table

## Error Handling & Self-Annealing
- filterByFormula must wrap field names in `{}` curly braces: `{AI One-Pager} = ''`
- If `research_company.py` fails on LinkedIn (no field / Apify quota), falls back gracefully to generating `founder_background` from the Message field
- If Playwright PDF render fails, run: `playwright install chromium`
- If Claude API returns 400 "credit balance too low", add credits at console.anthropic.com
- `AI One-Pager` is a URL text field — upload script POSTs PDF to Airtable Content API and writes the returned URL into the field
