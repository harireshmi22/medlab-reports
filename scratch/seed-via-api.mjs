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
  console.log("Starting seed via Supabase Auth API...");

  const usersToCreate = [
    {
      email: "admin@medlab.com",
      password: "medlab123456",
      name: "Dr. Sarah Chen",
      role: "admin"
    },
    {
      email: "john.doe@medlab.com",
      password: "medlab123456",
      name: "John Doe",
      role: "patient"
    },
    {
      email: "elena.smith@medlab.com",
      password: "medlab123456",
      name: "Elena Smith",
      role: "patient"
    }
  ];

  for (const u of usersToCreate) {
    console.log(`Creating user: ${u.email}...`);
    const { data, error } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
      options: {
        data: {
          name: u.name,
          role: u.role
        }
      }
    });

    if (error) {
      if (error.message.includes("already registered") || error.message.includes("already exists")) {
        console.log(`User ${u.email} already exists, skipping signup.`);
      } else {
        console.error(`Error creating ${u.email}:`, error.message);
      }
    } else {
      console.log(`Successfully signed up ${u.email}. User ID: ${data.user?.id}`);
    }
  }

  console.log("\nChecking created profiles in public.profiles table...");
  const { data: profiles, error: profErr } = await supabase.from("profiles").select("*");
  if (profErr) {
    console.error("Error fetching profiles:", profErr);
  } else {
    console.log("Current profiles in database:", profiles);
  }
}

main().catch(console.error);
