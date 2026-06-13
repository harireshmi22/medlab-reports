import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Signing up john.doe@medlab.com...");
  const { data, error } = await supabase.auth.signUp({
    email: "john.doe@medlab.com",
    password: "medlab123456",
    options: {
      data: {
        name: "John Doe",
        role: "patient"
      }
    }
  });

  if (error) {
    console.error("Signup failed:", error);
  } else {
    console.log("Signup success:", data);
  }
}

test().catch(console.error);
