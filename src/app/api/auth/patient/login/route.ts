import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {

        // get the email and password from the reques.json from client
        const { email, password } = await request.json();

        // if email exist on the supabase or not 
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // check if user is patient or admin
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error || !data.user || !data.session) {
            return NextResponse.json({ success: false, message: error?.message || "Invalid login credentials" }, { status: 401 })
        }

        const { data: profile, error: profileError } = await supabase.from("profiles")
            .select("id, full_name, role")
            .eq("id", data.user.id)
            .single()

        // if the role is not patient (case-insensitive check)
        if (profile?.role?.toLowerCase() !== "patient") {
            return NextResponse.json({ success: false, message: "You are not authorized to login as patient" }, { status: 403 })
        }


        let redirectTo = "/patient/dashboard";

        if (profile.role === "admin" || profile.role === "lab_staff") {
            redirectTo = "/admin/dashboard";
        }

        return NextResponse.json(
            {
                success: true,
                message: "Login successful",
                token: data.session.access_token,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                },
                profile,
                redirectTo,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Login route error:", error);
        return NextResponse.json({ message: "Something Went wrong", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}