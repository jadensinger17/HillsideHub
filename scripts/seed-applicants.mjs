/**
 * Seeds applicants from Deliberation Acceptance.csv into the database.
 * Run with: node scripts/seed-applicants.mjs
 *
 * WARNING: Clears all existing applicants and rubrics first.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
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

// Normalized decision values from the CSV
// Raw CSV decision → { decision, status }
function normalizeDecision(raw) {
  const val = raw.trim().toLowerCase();
  if (val === "yes") return { decision: "yes", status: "interview" };
  if (val === "no") return { decision: "no", status: "pending" };
  if (val === "maybe") return { decision: "maybe", status: "pending" };
  if (val === "no/class" || val === "no/class" || val === "class") return { decision: "no_class", status: "pending" };
  return { decision: "no", status: "pending" };
}

const APPLICANTS = [
  { name: "Aaron Rouse",                  info_sessions: 1, raw: "No" },
  { name: "Aaryan Gupta",                 info_sessions: 2, raw: "YES" },
  { name: "Adithya Nataraj",              info_sessions: 1, raw: "YES" },
  { name: "Aditya Nair",                  info_sessions: 0, raw: "NO" },
  { name: "Adrian Nottelmann",            info_sessions: 0, raw: "NO" },
  { name: "Ahmed Osman",                  info_sessions: 4, raw: "YES" },
  { name: "Albi Bylyku",                  info_sessions: 1, raw: "Maybe" },
  { name: "Alexander Greenberg",          info_sessions: 0, raw: "No/Class" },
  { name: "Almari Castillo",              info_sessions: 0, raw: "Yes" },
  { name: "Amir Alston",                  info_sessions: 0, raw: "No" },
  { name: "Andrew Vaill",                 info_sessions: 0, raw: "No" },
  { name: "Andre LaRochelle",             info_sessions: 4, raw: "Yes" },
  { name: "Arianna Kedersha",             info_sessions: 1, raw: "No/Class" },
  { name: "Arfa Begum",                   info_sessions: 0, raw: "Yes" },
  { name: "Arya Patel",                   info_sessions: 2, raw: "Yes" },
  { name: "Benjamin Anderson",            info_sessions: 1, raw: "Yes" },
  { name: "Bhayesha Raj Chugh",           info_sessions: 0, raw: "No" },
  { name: "Brandon Chan",                 info_sessions: 0, raw: "Yes" },
  { name: "Brenden Boyer",                info_sessions: 0, raw: "No" },
  { name: "Caleb Awuah",                  info_sessions: 4, raw: "Yes" },
  { name: "Caroline Bernacki",            info_sessions: 0, raw: "Maybe" },
  { name: "Chloe Morales",                info_sessions: 0, raw: "Yes" },
  { name: "Clive Leung",                  info_sessions: 1, raw: "Yes" },
  { name: "Cole Ostrosky",                info_sessions: 1, raw: "Yes" },
  { name: "Colin McGann",                 info_sessions: 0, raw: "Yes" },
  { name: "Collin Murray",                info_sessions: 2, raw: "Yes" },
  { name: "Cristian Jimenez",             info_sessions: 3, raw: "Yes" },
  { name: "Dev Gorasiya",                 info_sessions: 1, raw: "Yes" },
  { name: "Egor Vasilyev",                info_sessions: 0, raw: "Yes" },
  { name: "Ethan Masoperh",               info_sessions: 0, raw: "No" },
  { name: "Evan Espino",                  info_sessions: 0, raw: "No" },
  { name: "Evan Michael Morrow",          info_sessions: 0, raw: "Maybe" },
  { name: "Faryal Akbar",                 info_sessions: 2, raw: "Yes" },
  { name: "Filip Ciganik",                info_sessions: 0, raw: "No" },
  { name: "Giacomo Vinces",               info_sessions: 0, raw: "No" },
  { name: "Grejs Shelcaj",                info_sessions: 0, raw: "Yes" },
  { name: "Hannah Krause",                info_sessions: 0, raw: "No" },
  { name: "Hannah Patz",                  info_sessions: 0, raw: "No" },
  { name: "Hyeongyu (David) Kang",        info_sessions: 0, raw: "Yes" },
  { name: "Ikechukwu Ugwa",               info_sessions: 3, raw: "Yes" },
  { name: "Israela Anane",                info_sessions: 3, raw: "No/Class" },
  { name: "Jackson Cafarella",            info_sessions: 1, raw: "Class" },
  { name: "Jaime Lugo",                   info_sessions: 0, raw: "No" },
  { name: "Jaden King",                   info_sessions: 2, raw: "Yes" },
  { name: "Jake Miller",                  info_sessions: 1, raw: "Maybe" },
  { name: "Jeffrey Ortiz",                info_sessions: 1, raw: "No" },
  { name: "Jessica Ndjomou",              info_sessions: 2, raw: "No/Class" },
  { name: "Jiaying Lyu",                  info_sessions: 0, raw: "No" },
  { name: "Jocelyn Pumayugra",            info_sessions: 0, raw: "No" },
  { name: "Julia Tkachuk-Kyrychenko",     info_sessions: 1, raw: "No" },
  { name: "Justin A. Gomes",              info_sessions: 1, raw: "Maybe" },
  { name: "Kaelyn Horn",                  info_sessions: 0, raw: "Yes" },
  { name: "Kaia Wotzak",                  info_sessions: 2, raw: "Yes" },
  { name: "Kayla Le",                     info_sessions: 1, raw: "No" },
  { name: "Kiril Kovalenko",              info_sessions: 0, raw: "Yes" },
  { name: "Kishan Desai",                 info_sessions: 3, raw: "Yes" },
  { name: "Kuba Gaska",                   info_sessions: 0, raw: "No" },
  { name: "Kunal Ramchandani",            info_sessions: 0, raw: "Maybe" },
  { name: "Lily Bartone",                 info_sessions: 2, raw: "No/Class" },
  { name: "Luka Vidacak",                 info_sessions: 2, raw: "No" },
  { name: "Lucas Sosnow",                 info_sessions: 0, raw: "Yes" },
  { name: "Malachi Evans",                info_sessions: 0, raw: "No" },
  { name: "Malin Kimani Gitau",           info_sessions: 0, raw: "No" },
  { name: "Massimo Costa",                info_sessions: 0, raw: "No" },
  { name: "Matteo Festa",                 info_sessions: 1, raw: "No" },
  { name: "Matthew Spector",              info_sessions: 0, raw: "Maybe" },
  { name: "Michael Del Sesto",            info_sessions: 3, raw: "Yes" },
  { name: "Mohammed Nur",                 info_sessions: 0, raw: "No" },
  { name: "Natalie Ross",                 info_sessions: 0, raw: "No" },
  { name: "Nestor Castillo Jr.",          info_sessions: 0, raw: "No/Class" },
  { name: "Nicholas Battaglia",           info_sessions: 0, raw: "No" },
  { name: "Nick Taipe",                   info_sessions: 0, raw: "No/Class" },
  { name: "Nikita Panwar",                info_sessions: 1, raw: "Yes" },
  { name: "Nicolas Sconziano",            info_sessions: 0, raw: "No" },
  { name: "Nnadozie Okasi",               info_sessions: 0, raw: "No" },
  { name: "Nya Cohen",                    info_sessions: 2, raw: "No/Class" },
  { name: "Oliver Kaplan",                info_sessions: 2, raw: "Yes" },
  { name: "Omar Omar",                    info_sessions: 3, raw: "No" },
  { name: "Patryk Zielinski",             info_sessions: 0, raw: "No" },
  { name: "Pristine Ruhuma",              info_sessions: 0, raw: "No/Class" },
  { name: "Rahul Perumal",                info_sessions: 0, raw: "Class" },
  { name: "Ranganathan Kidambi",          info_sessions: 2, raw: "Yes" },
  { name: "Rayden Jones-Miller",          info_sessions: 1, raw: "No" },
  { name: "Ria Verma",                    info_sessions: 0, raw: "Yes" },
  { name: "Rige Grajcevci",               info_sessions: 0, raw: "No" },
  { name: "Riley Ramirez",                info_sessions: 0, raw: "Maybe" },
  { name: "Roan Fothergill",              info_sessions: 1, raw: "No/Class" },
  { name: "Sahil Sheik",                  info_sessions: 2, raw: "Maybe" },
  { name: "Sara Shawahna",                info_sessions: 0, raw: "Yes" },
  { name: "Sebastian Ramos",              info_sessions: 3, raw: "Yes" },
  { name: "Sebastian Wroblewski",         info_sessions: 2, raw: "Yes" },
  { name: "Shubham Chandra",              info_sessions: 1, raw: "No/Class" },
  { name: "Stephen Sentementes",          info_sessions: 4, raw: "Maybe" },
  { name: "Theodore Mitchell",            info_sessions: 3, raw: "Yes" },
  { name: "Thomson Tran",                 info_sessions: 1, raw: "No/Class" },
  { name: "Tristan Gorman",               info_sessions: 0, raw: "No/Class" },
  { name: "Vedika Patel",                 info_sessions: 0, raw: "No" },
  { name: "Vincent Ly",                   info_sessions: 2, raw: "No" },
  { name: "Will Curry",                   info_sessions: 0, raw: "Yes" },
  { name: "Zachary Harrison",             info_sessions: 0, raw: "Yes" },
  { name: "Zion Joseph",                  info_sessions: 3, raw: "No" },
  { name: "Christian Kim",                info_sessions: 0, raw: "Yes" },
  { name: "Sean McGowan",                 info_sessions: 0, raw: "No" },
  { name: "Antonio Juan Umali",           info_sessions: 0, raw: "Yes" },
  { name: "Kaid Algozy",                  info_sessions: 0, raw: "No" },
  { name: "Liam Naughton",                info_sessions: 0, raw: "Yes" },
];

async function run() {
  console.log("Clearing existing rubrics and applicants...");

  const { error: rubricErr } = await supabase.from("interview_rubrics").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (rubricErr) console.error("Rubric clear error:", rubricErr.message);

  const { error: appErr } = await supabase.from("applicants").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (appErr) console.error("Applicant clear error:", appErr.message);

  console.log("Inserting applicants...");

  const rows = APPLICANTS.map(({ name, info_sessions, raw }) => {
    const { decision, status } = normalizeDecision(raw);
    return {
      name,
      info_sessions,
      decision,
      status,
      gpa: 0,
      email: null,
      application_message: null,
      resume_path: null,
    };
  });

  const { data: inserted, error: insertErr } = await supabase
    .from("applicants")
    .insert(rows)
    .select("id, name, status");

  if (insertErr) {
    console.error("Insert error:", insertErr.message);
    return;
  }

  console.log(`✅ Inserted ${inserted.length} applicants`);

  // Create rubrics for all interview-status applicants
  const interviewIds = inserted.filter((a) => a.status === "interview").map((a) => a.id);
  console.log(`Creating rubrics for ${interviewIds.length} interview applicants...`);

  if (interviewIds.length > 0) {
    const rubrics = interviewIds.map((applicant_id) => ({
      applicant_id,
      template: {},
      responses: {},
      is_complete: false,
    }));

    const { error: rubricInsertErr } = await supabase.from("interview_rubrics").insert(rubrics);
    if (rubricInsertErr) console.error("Rubric insert error:", rubricInsertErr.message);
    else console.log(`✅ Created ${interviewIds.length} rubrics`);
  }

  const yes = rows.filter((r) => r.decision === "yes").length;
  const no = rows.filter((r) => r.decision === "no").length;
  const maybe = rows.filter((r) => r.decision === "maybe").length;
  const no_class = rows.filter((r) => r.decision === "no_class").length;
  console.log(`\nSummary: ${yes} Yes · ${no} No · ${maybe} Maybe · ${no_class} No/Class`);
}

run().catch(console.error);
