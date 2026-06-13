import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const testUsers = [
    { email: "admin@medlab.com", password: "medlab123456" },
    { email: "john.doe@medlab.com", password: "medlab123456" }
  ];

  for (const user of testUsers) {
    console.log(`\nTesting sign in for ${user.email}...`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password
    });

    if (authError) {
      console.error(`Sign in failed for ${user.email}:`, authError.message);
      continue;
    }

    console.log(`Sign in successful for ${user.email}!`);
    console.log("User ID:", authData.user.id);

    console.log("Fetching profile...");
    const { data: profile, error: profError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profError) {
      console.error("Failed to fetch profile:", profError.message);
    } else {
      console.log("Profile details:", profile);
    }
  }
}

test().catch(console.error);
