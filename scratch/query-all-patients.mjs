import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Signing in as admin@medlab.com...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "admin@medlab.com",
    password: "medlab123456"
  });

  if (authError) {
    console.error("Sign in failed:", authError.message);
    return;
  }

  console.log("Logged in! Fetching all patients...");
  const { data: patients, error: pError } = await supabase
    .from("patients")
    .select("*");

  console.log("All Patients in DB:", patients, "Error:", pError?.message);

  console.log("Fetching all reports...");
  const { data: reports, error: rError } = await supabase
    .from("reports")
    .select("*, report_items(*)");

  console.log("All Reports in DB:", reports, "Error:", rError?.message);
}

test().catch(console.error);
