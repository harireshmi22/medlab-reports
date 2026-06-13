import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        
        // This signs out the user and clears Supabase session cookies
        await supabase.auth.signOut();
        
        return NextResponse.json({ success: true, message: "Logged out successfully" }, { status: 200 });
    } catch (error) {
        console.error("Logout API error:", error);
        return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
    }
}
