# login Flow Bug Report

We analyzed the patient login flow (`src/app/patient/login/page.tsx` and `src/app/api/(auth)/patient/login/route.ts`) and found three critical issues that prevent successful logins.

---

## 1. Issues Identified

### A. Case Mismatch for User Roles

* **File**: `src/app/api/(auth)/patient/login/route.ts` (Lines 34-37)
* **Bug**: The server validation checks if `profile?.role !== "Patient"` (capitalized "Patient"). However, the database schema (enum `user_role`) and profiles utilize lowercase roles: `'patient'`, `'admin'`, and `'lab_staff'`.
* **Impact**: Users with a valid patient profile will always fail this check, returning a `403 Forbidden` response: `"You are not authorized to login as patient"`.

### B. Mismatch in API Response and Client State Expectations

* **Files**: `src/app/patient/login/page.tsx` (Lines 33-40) and `src/app/api/(auth)/patient/login/route.ts` (Lines 44-59)
* **Bug**: The client-side login logic expects the server response to have:
  * `success`: boolean
  * `token`: string (to be stored in `localStorage` as `auth_token`)
  
  However, the server responds with a custom payload containing `message`, `user`, `profile`, and `redirectTo`, but **without** `success` or `token`.
* **Impact**: Since `data.success` is `undefined` (falsy), the client page treats a successful HTTP `200` response as a login failure and displays the server's `"Login successful"` text in a **red error box** instead of logging the user in.

### C. Mismatched Autofill / Seed Credentials

* **Files**: `src/app/patient/login/page.tsx` (Lines 55-59) vs `scripts/seed-data.sql`
* **Bug**: The quick autofill button enters `patient@medlabs.com` / `patient123`. However, the seeded Supabase auth database only contains:
  * `john.doe@medlab.com` / `medlab123456`
  * `elena.smith@medlab.com` / `medlab123456`
  * `marcus.brown@medlab.com` / `medlab123456`
  * `rachel.white@medlab.com` / `medlab123456`
* **Impact**: autofilled credentials will fail to log in against the database.

---

## 2. Solutions

### Solution for `src/app/api/(auth)/patient/login/route.ts`

We must modify the API response to include the `success` status, return the `access_token` as `token`, and verify the role in a case-insensitive manner (e.g., `.toLowerCase() === "patient"`).

```typescript
// if the role is not patient (case-insensitive)
if (profile?.role?.toLowerCase() !== "patient") {
    return NextResponse.json(
        { success: false, message: "You are not authorized to login as patient" },
        { status: 403 }
    );
}

return NextResponse.json(
    {
        success: true,
        message: "Login successful",
        token: data.session?.access_token,
        user: {
            id: data.user.id,
            email: data.user.email,
        },
        profile,
        redirectTo,
    },
    { status: 200 }
);
```

### Solution for `src/app/patient/login/page.tsx`

Update the quick fill credentials to map to a seeded patient (e.g., `john.doe@medlab.com` / `medlab123456`).
