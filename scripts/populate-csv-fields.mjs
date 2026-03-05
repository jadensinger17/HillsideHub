/**
 * Reads HV Genesis Fund Fall 2026 Application.csv and updates existing
 * applicants in Supabase with gpa, major, expected_graduation, linkedin_url,
 * why_hillside, contribution, vertical_interest.
 *
 * Matches rows by Full Name. Run with:
 *   node scripts/populate-csv-fields.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- parse .env.local ---
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "../.env.local"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
    .filter(([k, v]) => k && v)
);

const supabase = createClient(
  env["NEXT_PUBLIC_SUPABASE_URL"],
  env["SUPABASE_SERVICE_ROLE_KEY"],
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// --- CSV parser (no dependencies, handles quoted fields with newlines) ---
function parseCSV(buffer) {
  // Decode as latin1 which maps bytes 1:1 — handles mac_roman / windows-1252
  const text = buffer.toString("latin1");
  const rows = [];
  let inQuote = false;
  let field = "";
  let row = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuote) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuote = false; }
      else { field += ch; }
    } else {
      if (ch === '"') { inQuote = true; }
      else if (ch === ',') { row.push(field); field = ""; }
      else if (ch === '\n') {
        row.push(field); field = "";
        rows.push(row); row = [];
      } else if (ch === '\r') { /* skip */ }
      else { field += ch; }
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }

  const headers = rows[0];
  return rows.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, i) => { obj[h.trim()] = (r[i] ?? "").trim(); });
    return obj;
  });
}

function parseGpa(raw) {
  if (!raw) return null;
  const s = raw.trim().replace(":", ".").split("/")[0].trim().split(" ")[0];
  const v = parseFloat(s);
  if (isNaN(v)) return null;
  if (v > 4.0) return 4.0;
  if (v >= 0.0) return Math.round(v * 100) / 100;
  return null;
}

function normalizeLinkedin(raw) {
  if (!raw || raw.toUpperCase() === "N/A") return null;
  const url = raw.trim();
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return "https://" + url;
}

// --- Main ---
const csvBuffer = readFileSync(
  resolve(__dirname, "../HV Genesis Fund Fall 2026 Application.csv")
);
const rows = parseCSV(csvBuffer).filter((r) => r["Full Name"]);

let updated = 0, skipped = 0, errors = 0;

for (const row of rows) {
  const name = row["Full Name"];
  if (!name) { skipped++; continue; }

  const updates = {};

  const gpa = parseGpa(row["GPA"]);
  if (gpa !== null) updates.gpa = gpa;

  if (row["Major/Minor"]) updates.major = row["Major/Minor"];
  if (row["Expected Graduation"]) updates.expected_graduation = row["Expected Graduation"];

  const linkedin = normalizeLinkedin(row["Please provide your LinkedIn URL below."]);
  if (linkedin) updates.linkedin_url = linkedin;

  if (row["Why Hillside Ventures?"]) updates.why_hillside = row["Why Hillside Ventures?"];
  if (row["How can you contribute to the Genesis Fund?"]) updates.contribution = row["How can you contribute to the Genesis Fund?"];
  if (row["Vertical of Interest?"]) updates.vertical_interest = row["Vertical of Interest?"];

  if (Object.keys(updates).length === 0) { skipped++; continue; }

  const { error } = await supabase
    .from("applicants")
    .update(updates)
    .eq("name", name);

  if (error) {
    console.error(`❌  ${name}: ${error.message}`);
    errors++;
  } else {
    console.log(`✓  ${name}`);
    updated++;
  }
}

console.log(`\nDone — ${updated} updated, ${skipped} skipped, ${errors} errors`);
