# LIS Authentication & Access Control Flow

This document details the login, route protection, and logout mechanics implemented across the MedLab LIS application.

---

## 1. Sequence & Flow Diagram

The diagram below illustrates how route access is protected by the Next.js middleware proxy, and how authentication/logout requests are routed and checked.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as Client Browser
    participant Proxy as Next.js Proxy (src/proxy.ts)
    participant API as Auth API Routes
    participant DB as Supabase DB

    %% 1. Route Protection Request
    Note over User, Proxy: 1. Route Protection & Middleware Proxy Flow
    User->>Browser: Access /admin/dashboard
    Browser->>Proxy: GET /admin/dashboard (with cookies)
    Proxy->>Proxy: supabase.auth.getClaims()
    alt No Active Session Cookie
        Proxy-->>Browser: Redirect to /admin/login
        Browser-->>User: Render Admin Login Form
    else Active Session Cookie Exists
        Proxy->>DB: Query profile role for User ID (user.sub)
        DB-->>Proxy: Return profile details (role)
        alt Role is admin or lab_staff
            Proxy-->>Browser: Proceed to /admin/dashboard
            Browser-->>User: Render Admin Dashboard
        else Role is patient (Unauthorized)
            Proxy-->>Browser: Redirect to /admin/login
        end
    end

    %% 2. Login Flow
    Note over User, DB: 2. Authentication Flow (Login)
    User->>Browser: Submit credentials (admin@medlab.com)
    Browser->>API: POST /api/auth/admin/login (email, password)
    API->>DB: supabase.auth.signInWithPassword()
    DB-->>API: Authentication success & set session cookies
    API->>DB: Query profile role for User ID
    DB-->>API: Return role ('admin')
    API-->>Browser: return success JSON (redirect to /admin/dashboard)
    Browser->>Browser: Save token & role to localStorage
    Browser->>Proxy: GET /admin/dashboard (with cookies)
    Proxy-->>Browser: Allow access
    Browser-->>User: Render Admin Dashboard

    %% 3. Logout Flow
    Note over User, Proxy: 3. Session Cleanup Flow (Logout)
    User->>Browser: Click 'Logout' button
    Browser->>Browser: Clear localStorage auth_token & user_role
    Browser->>API: POST /api/auth/logout
    API->>DB: supabase.auth.signOut() (removes cookie tokens)
    API-->>Browser: return success JSON
    Browser-->>User: Redirect to Landing page (/) & Reload
```

---

## 2. Component Explanations

### A. Middleware Proxy (`src/proxy.ts` & `src/lib/supabase/proxy.ts`)

- **Location**: Runs on Next.js edge-runtime/server-side boundaries.
- **Paths Protected**: `/admin/dashboard` (and subpaths), `/patient/dashboard` (and subpaths).
- **Behavior**:
  1. Calls `supabase.auth.getClaims()` to verify if a valid JWT exists in cookies.
  2. If none is found, redirects `/admin/*` to `/admin/login` and `/patient/*` to `/patient/login`.
  3. If found, queries the user's role in the `profiles` table to prevent role cross-access (e.g. a patient cannot view admin metrics, and vice versa).
  4. Automatically redirects authenticated users *away* from login pages (e.g., if a logged-in admin tries to open `/admin/login`, they are instantly pushed to `/admin/dashboard`).

### B. Login API Endpoints (`/api/auth/admin/login` & `/api/auth/patient/login`)

- **Responsibility**: Authenticating credentials securely on the server.
- **Cookie Syncing**: Using `@supabase/ssr` to configure cookies correctly in browser headers, which are sent back on downstream requests.
- **Verification**: Verifies role matches the login route before returning success. If not, it signs them out immediately to keep the auth state clean.

### C. Logout API Endpoint (`/api/auth/logout`)

- **Responsibility**: Clearing server-side authentication state.
- **Mechanism**: Calls `supabase.auth.signOut()`, which clears all Supabase-related authentication cookies (`sb-...-auth-token`) from the browser response.
- **Client cleanup**: Coordinated with local clearing of `auth_token` and `user_role` in `localStorage`.
