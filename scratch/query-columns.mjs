import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  // Let's run a select query on reports and profiles to see if we can get columns
  console.log("Querying profiles table columns...");
  const { data: pData, error: pError } = await supabase.from("profiles").select().limit(1);
  console.log("profiles columns:", pData ? Object.keys(pData[0] || {}) : null, "error:", pError?.message);

  console.log("Querying reports table columns...");
  const { data: rData, error: rError } = await supabase.from("reports").select().limit(1);
  console.log("reports columns:", rData ? Object.keys(rData[0] || {}) : null, "error:", rError?.message);
}

inspect().catch(console.error);
