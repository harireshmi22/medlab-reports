import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing sign in for harireshmi22@gmail.com...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "harireshmi22@gmail.com",
    password: "123456"
  });

  if (authError) {
    console.error("Sign in failed:", authError.message);
    return;
  }

  console.log("Sign in successful!");
  console.log("User ID:", authData.user.id);
  console.log("Email:", authData.user.email);

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

test().catch(console.error);
