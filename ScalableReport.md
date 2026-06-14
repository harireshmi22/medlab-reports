# 🏗️ Scalable Report & Learning Guide — MedLab Reports LIS

This document contains a comprehensive analysis of the bug fixes applied to the MedLab LIS codebase, details of remaining small/large architectural issues, their production-ready solutions, and a structured learning and practice roadmap.

---

## 📋 Table of Contents
1. [Fixed Bugs & Verification Checklist](#1-fixed-bugs--verification-checklist)
2. [Identified Outstanding Issues & Solutions](#2-identified-outstanding-issues--solutions)
   - [Small / Medium Bugs](#a-small--medium-bugs)
   - [Large / Architectural Issues](#b-large--architectural-issues)
3. [Learning & Practice Guide](#3-learning--practice-guide)

---

## 1. Fixed Bugs & Verification Checklist

Here is the breakdown of the critical bugs that have been successfully fixed and verified in the codebase:

### ✅ 1. Blood Group Persistence
- **Problem:** Registered patients always defaulted to `O+` because the field was ignored in API routes.
- **Fix:** Updated [route.ts (patient registration)](file:///c:/Users/harir/Desktop/medlabs-report/src/app/api/patient/route.ts#L76-L107) and [route.ts (patient detail update)](file:///c:/Users/harir/Desktop/medlabs-report/src/app/api/patient/%5Bid%5D/route.ts#L53-L88) to parse the `bloodGroup` parameter and save/update the `blood_group` column in the database, with a fallback/retry mechanism if the column doesn't exist.

### ✅ 2. Patient Edit/Delete Operations
- **Problem:** Admins had no way to edit patient profiles or delete them.
- **Fix:** Created a new dynamic route [[id]/route.ts](file:///c:/Users/harir/Desktop/medlabs-report/src/app/api/patient/%5Bid%5D/route.ts) supporting `PUT` and `DELETE` HTTP methods. Wired edit and delete confirmation modals in [PatientsPanel.tsx](file:///c:/Users/harir/Desktop/medlabs-report/src/app/patient/component/PatientsPanel.tsx).

### ✅ 3. Dynamic Date and Count Telemetry
- **Problem:** The admin overview dashboard displayed a hardcoded date (`Today: Oct 24, 2026`) and static stat counts.
- **Fix:** Replaced hardcoded date strings with `new Date().toLocaleDateString(...)` in [AdminDashboard.tsx](file:///c:/Users/harir/Desktop/medlabs-report/src/app/admin/component/AdminDashboard.tsx#L114-L117) and derived all count stats from real PostgreSQL counts.

### ✅ 4. Consolidated Supabase Client Pattern
- **Problem:** Session desynchronization between a standard `localStorage` client (`supabase/index.ts`) and `@supabase/ssr` (`supabase/client.ts`).
- **Fix:** Consolidated all clients to import either browser-side ssr factory (`supabase/client.ts`) or server-side cookie factory (`supabase/server.ts`). Deprecated the old `localStorage` client.

### ✅ 5. Framer Motion Import Consistencies
- **Problem:** Files mixed import namespaces (`framer-motion` vs `motion/react`), resulting in double dependency loads.
- **Fix:** Standardized all imports to use `motion/react` (the new standard for Motion v12).

### ✅ 6. Memory Leak in Upload Scanner
- **Problem:** Simulating the optical character recognition scan with `setInterval` caused a memory leak when modals unmounted during active scans.
- **Fix:** Used a ref (`intervalRef`) to track the running interval and cleaned it up on component unmount in [AddReport.tsx](file:///c:/Users/harir/Desktop/medlabs-report/src/app/admin/component/AddReport.tsx#L215-L221).

### ✅ 7. Server-Side Routing Guards (Next.js 16 Proxy Convention)
- **Problem:** Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`. Attempting to use `middleware.ts` throws compile-time deprecation warnings.
- **Fix:** Confirmed the session-handling guard in [proxy.ts](file:///c:/Users/harir/Desktop/medlabs-report/src/proxy.ts) operates as a routing filter, validating user jwt claims on every HTTP request and redirecting unauthenticated traffic to login routes.

### ✅ 8. Hiding Sensitive Credentials
- **Problem:** The password input field in the patient registration form was set to `type="text"`, making typed passwords visible.
- **Fix:** Updated the input element in [PatientsPanel.tsx](file:///c:/Users/harir/Desktop/medlabs-report/src/app/patient/component/PatientsPanel.tsx#L636) to `type="password"` to mask inputs properly.

---

## 2. Identified Outstanding Issues & Solutions

These are newly identified and outstanding issues in the project categorized by severity.

### A. Small / Medium Bugs

#### 1. Missing Database Audit Trail Triggers
- **Problem:** Although the table `audit_log` is declared in [setup-database.sql](file:///c:/Users/harir/Desktop/medlabs-report/scripts/setup-database.sql#L418-L428), there are no database triggers to automatically write history logs when changes occur in `patients` or `reports`.
- **Solution:** Add a PostgreSQL trigger function that writes logs automatically.
```sql
CREATE OR REPLACE FUNCTION log_patient_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, record_id, action, changed_by, old_data, new_data)
  VALUES (
    'patients',
    coalesce(NEW.id, OLD.id)::text,
    TG_OP,
    auth.uid(),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_audit_patients
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION log_patient_changes();
```

#### 2. Missing Database Indexes
- **Problem:** At scale, querying patient lists, searching names, or fetching report histories will query-scan tables sequentially, leading to poor page load times.
- **Solution:** Create indexes on frequently filtered/ordered columns in PostgreSQL:
```sql
CREATE INDEX idx_patients_search ON patients USING gin (to_tsvector('english', name || ' ' || email || ' ' || phone));
CREATE INDEX idx_reports_patient_date ON reports (patient_id, created_at DESC);
```

#### 3. Simulating PDF Parsing (API Fallback Compatibility)
- **Problem:** In [route.ts (upload-reports)](file:///c:/Users/harir/Desktop/medlabs-report/src/app/api/upload-reports/route.ts#L18-L26), importing `PDFParse` as a named export from `pdf-parse` is non-standard. The official library `pdf-parse` exposes a default function export. Although the TypeScript declaration compiles, at runtime `new PDFParse(...)` can trigger `TypeError: PDFParse is not a constructor`.
- **Solution:** Re-align to use the default function export:
```typescript
import pdf from 'pdf-parse';

// Use as:
try {
  const result = await pdf(buffer);
  pdfText = result.text || '';
} catch (parseError) {
  console.error('pdf-parse error:', parseError);
}
```

---

### B. Large / Architectural Issues

#### 1. Lack of API Rate Limiting
- **Problem:** The endpoint `/api/upload-reports` accepts binary uploads but has no rate-limiting. A malicious user could abuse the API by sending thousands of large files, inflating Supabase storage bandwidth costs and database sizes.
- **Solution:** Apply a middleware rate-limiting interceptor in the routing path [proxy.ts](file:///c:/Users/harir/Desktop/medlabs-report/src/proxy.ts) utilizing Redis or an in-memory token bucket scheme for local development.

#### 2. CSRF/XSRF Protection
- **Problem:** The app stores access sessions using browser cookies, making it susceptible to Cross-Site Request Forgery (CSRF) on POST/PUT/DELETE API endpoints.
- **Solution:** Set up a CSRF token verification middleware in Next.js that checks request headers (`x-csrf-token`) against session cookies.

#### 3. Client Component Bloat & Lacking Error Boundaries
- **Problem:** Heavy parts of the admin panel (like [AddReport](file:///c:/Users/harir/Desktop/medlabs-report/src/app/admin/component/AddReport.tsx)) load statically. If a component fails or crashes, the entire page blacks out due to a lack of React `ErrorBoundary` wrappers.
- **Solution:** Implement a Next.js `error.tsx` file for dynamic boundary isolation, and split component loads:
```typescript
import dynamic from 'next/dynamic';

const AddReportModal = dynamic(() => import('../component/AddReport'), {
  loading: () => <Loader2 className="animate-spin w-6 h-6" />,
  ssr: false
});
```

---

## 3. Learning & Practice Guide

To get hands-on experience and master these concepts, implement these exercises step-by-step in this repository:

### 🛠️ Exercise 1: Implement Dynamic Search using database indexes (SQL + API)
- **Concept:** Client-side filters degrade performance with >1000 items. Server-side ILIKE filters or Full-Text search indexes are much faster.
- **Practice:**
  1. Open your Supabase SQL editor and run `CREATE INDEX idx_patients_name ON patients(name);`.
  2. Implement an API route parameter check: `const search = url.searchParams.get('q');`.
  3. Modify the Supabase JS query: `.from('patients').select('*').ilike('name', `%${search}%`)`.
  4. Integrate the search string input inside [PatientsPanel.tsx](file:///c:/Users/harir/Desktop/medlabs-report/src/app/patient/component/PatientsPanel.tsx) with a debounce function so it doesn't query on every keystroke.

### 🛠️ Exercise 2: Set up rate-limiting on PDF uploads
- **Concept:** Protecting server bandwidth and disk storage from abuse.
- **Practice:**
  1. Inspect the in-memory rate-limiter design proposed in [ScalableArchitecture.md (Section 6)](file:///c:/Users/harir/Desktop/medlabs-report/ScalableArchitecture.md#L487).
  2. Add the rate-limiter helper to `src/lib/rate-limit.ts`.
  3. Import it inside [route.ts (upload-reports)](file:///c:/Users/harir/Desktop/medlabs-report/src/app/api/upload-reports/route.ts).
  4. Perform a check using the requester's IP (retrieved from `request.headers.get('x-forwarded-for')`) before processing the file buffer, returning a `429 Too Many Requests` status if the rate limit is exceeded.

### 🛠️ Exercise 3: Database Audit Trigger
- **Concept:** In medical applications (compliant with HIPAA/HL7 guidelines), audit logging is mandatory to keep track of who viewed, updated, or deleted records.
- **Practice:**
  1. Apply the PostgreSQL trigger code provided in Section 2-A of this guide to your Supabase instance.
  2. Make changes to a patient's details via the Admin Panel UI (e.g. edit a name or blood group).
  3. Query the `audit_log` table: `SELECT * FROM audit_log;` to verify that the operation type, timestamp, old record values, and new record values were logged correctly.
