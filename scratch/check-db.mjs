import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking profiles table...");
  const { data: profiles, error: pError } = await supabase.from("profiles").select("*").limit(5);
  console.log("profiles:", profiles, "error:", pError?.message);

  console.log("Checking medlab_profiles table...");
  const { data: mprofiles, error: mpError } = await supabase.from("medlab_profiles").select("*").limit(5);
  console.log("medlab_profiles:", mprofiles, "error:", mpError?.message);

  console.log("Checking reports table...");
  const { data: reports, error: rError } = await supabase.from("reports").select("*").limit(5);
  console.log("reports:", reports, "error:", rError?.message);

  console.log("Checking medlab_reports table...");
  const { data: mreports, error: mrError } = await supabase.from("medlab_reports").select("*").limit(5);
  console.log("medlab_reports:", mreports, "error:", mrError?.message);
}

check().catch(console.error);
