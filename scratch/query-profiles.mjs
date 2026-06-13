import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Fetching profiles from Supabase...");
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) {
    console.error("Error fetching profiles:", error);
  } else {
    console.log("Profiles list:", data);
  }
}

main().catch(console.error);
