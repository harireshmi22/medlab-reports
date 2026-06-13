import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const testEmails = [
    "john.doe@medlab.com",
    "john.doe@gmail.com",
    "john.doe.medlab.test@gmail.com"
  ];

  for (const email of testEmails) {
    console.log(`Testing signup for ${email}...`);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: "medlab123456",
      options: {
        data: {
          name: "John Doe Test",
          role: "patient"
        }
      }
    });

    if (error) {
      console.error(`  Failed: ${error.message}`);
    } else {
      console.log(`  Success! User ID: ${data.user?.id}`);
    }
  }
}

test().catch(console.error);
