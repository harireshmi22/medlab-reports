import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Signing in as john.doe@medlab.com...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "john.doe@medlab.com",
    password: "medlab123456"
  });

  if (authError) {
    console.error("Sign in failed:", authError.message);
    return;
  }

  console.log("Logged in! Fetching patients table details...");
  const { data: patients, error: pError } = await supabase
    .from("patients")
    .select("*");

  console.log("Patients for John Doe:", patients, "Error:", pError?.message);

  if (patients && patients.length > 0) {
    const pId = patients[0].id;
    console.log("Fetching reports for this patient...");
    const { data: reports, error: rError } = await supabase
      .from("reports")
      .select("*, report_items(*)")
      .eq("patient_id", pId);
    console.log("Reports:", reports, "Error:", rError?.message);
  }
}

test().catch(console.error);
