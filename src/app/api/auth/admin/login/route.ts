import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.user || !data.session) {
            return NextResponse.json({ success: false, message: error?.message || "Invalid login credentials" }, { status: 401 });
        }

        const { data: profile, error: profileError } = await supabase.from("profiles")
            .select("id, full_name, role")
            .eq("id", data.user.id)
            .single();

        const userRole = profile?.role?.toLowerCase();
        if (userRole !== "admin" && userRole !== "lab_staff") {
            // Sign out if role is not admin to keep session clean
            await supabase.auth.signOut();
            return NextResponse.json({ success: false, message: "You are not authorized to login as admin" }, { status: 403 });
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
                redirectTo: "/admin/dashboard",
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Login route error:", error);
        return NextResponse.json({ message: "Something went wrong", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

