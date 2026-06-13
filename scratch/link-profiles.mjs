import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
// Note: We use the admin credential or auth sign-in if needed, but since we want to modify patient records, 
// let's sign in as the admin, who has "Allow staff to manage patients" policy!
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Signing in as admin...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "admin@medlab.com",
    password: "medlab123456"
  });

  if (authError) {
    console.error("Admin sign in failed:", authError.message);
    return;
  }

  console.log("Logged in! Fetching profiles...");
  const { data: profiles, error: pError } = await supabase
    .from("profiles")
    .select("*");

  if (pError) {
    console.error("Failed to fetch profiles:", pError.message);
    return;
  }

  console.log("Profiles:", profiles);

  // We want to fetch all patients too
  const { data: patients, error: patError } = await supabase
    .from("patients")
    .select("*");

  if (patError) {
    console.error("Failed to fetch patients:", patError.message);
    return;
  }

  console.log("Patients:", patients);

  // Link profiles to patients by matching email/name
  // Wait, profiles don't store email, but they have full_name. Let's see:
  // John Doe profile has full_name = 'John Doe'
  // Elena Smith profile has full_name = 'Elena Smith'
  for (const prof of profiles) {
    if (prof.role === 'patient') {
      const matchedPatient = patients.find(p => p.name.toLowerCase() === prof.full_name.toLowerCase());
      if (matchedPatient) {
        console.log(`Linking profile ${prof.id} (${prof.full_name}) to patient ${matchedPatient.id}`);
        const { error: updateError } = await supabase
          .from("patients")
          .update({ profile_id: prof.id })
          .eq("id", matchedPatient.id);
        
        if (updateError) {
          console.error(`Failed to link profile:`, updateError.message);
        } else {
          console.log(`Successfully linked!`);
        }
      }
    }
  }
}

main().catch(console.error);
