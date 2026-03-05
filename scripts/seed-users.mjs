/**
 * One-time seed script to create initial users and set their roles.
 * Run with: node scripts/seed-users.mjs
 * Requires SUPABASE_SERVICE_ROLE_KEY to be set in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env.local manually
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.split("=").map((p) => p.trim()))
    .filter(([k, v]) => k && v)
);

const supabase = createClient(
  env["NEXT_PUBLIC_SUPABASE_URL"],
  env["SUPABASE_SERVICE_ROLE_KEY"],
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const USERS = [
  { email: "Eliyahucohen101@gmail.com", password: "ConnectAI123", role: "admin" },
  { email: "Jadensinger17@gmail.com",   password: "ConnectAI123", role: "admin" },
  { email: "22brickhouse@gmail.com",    password: "ConnectAI123", role: "analyst" },
];

async function run() {
  for (const user of USERS) {
    // Create auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    if (error) {
      if (error.message.includes("already been registered")) {
        console.log(`⚠️  ${user.email} already exists — updating role only`);
        // Find existing user id
        const { data: list } = await supabase.auth.admin.listUsers();
        const existing = list?.users?.find((u) => u.email === user.email.toLowerCase());
        if (existing) {
          await supabase
            .from("profiles")
            .update({ role: user.role })
            .eq("id", existing.id);
          console.log(`   ✅ Role set to ${user.role}`);
        }
      } else {
        console.error(`❌ Error creating ${user.email}:`, error.message);
      }
      continue;
    }

    const userId = data.user.id;

    // Set role in profiles (trigger may have already created the row as analyst)
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: userId, email: user.email, role: user.role }, { onConflict: "id" });

    if (profileError) {
      console.error(`❌ Profile update failed for ${user.email}:`, profileError.message);
    } else {
      console.log(`✅ Created ${user.email} as ${user.role}`);
    }
  }
}

run().catch(console.error);
