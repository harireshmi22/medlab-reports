# 🏗️ MedLab Reports — Scalable Architecture Guide

> A comprehensive document covering **current bugs, scalability bottlenecks, and production-ready solutions** for the MedLab Reports pathology LIS system.

---

## 📋 Table of Contents

1. [Current Architecture Overview](#1-current-architecture-overview)
2. [Identified Bugs & Fixes](#2-identified-bugs--fixes)
3. [Scalability Bottlenecks](#3-scalability-bottlenecks)
4. [Recommended Scalable Architecture](#4-recommended-scalable-architecture)
5. [Database Optimizations](#5-database-optimizations)
6. [Authentication & Security](#6-authentication--security)
7. [Performance Optimizations](#7-performance-optimizations)
8. [Deployment & DevOps](#8-deployment--devops)
9. [Step-by-Step Roadmap](#9-step-by-step-roadmap)

---

## 1. Current Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  Frontend (Next.js 16)           │
│  ┌───────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ Landing   │ │ Patient  │ │ Admin          │  │
│  │ Page      │ │ Dashboard│ │ Dashboard      │  │
│  └───────────┘ └──────────┘ └────────────────┘  │
│         │            │              │            │
│  ┌──────────────────────────────────────────┐   │
│  │          API Routes (/api/*)              │   │
│  │  /auth  /patient  /reports  /upload       │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────┘
                      │
          ┌───────────┴────────────┐
          │     Supabase Cloud     │
          │  ┌──────┐ ┌─────────┐  │
          │  │ Auth │ │Postgres │  │
          │  └──────┘ │Database │  │
          │           └─────────┘  │
          │  ┌─────────────────┐   │
          │  │  Storage Bucket │   │
          │  └─────────────────┘   │
          └────────────────────────┘
```

**Tech Stack:**

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript + React 19
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage (PDF uploads)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion / Motion

---

## 2. Identified Bugs & Fixes

### 🐛 Bug #1: Blood Group Not Persisted to Database

**Problem:** When registering a new patient, the `bloodGroup` field from the form was not sent to the API. The API route (`/api/patient`) hardcoded `bloodGroup: 'O+'` in the response without saving it.

**Impact:** All patients appeared with blood group `O+` regardless of what was selected.

**Fix Applied:**

```diff
// src/app/api/patient/route.ts
- const { name, email, password, age, gender, phone } = await request.json();
+ const { name, email, password, age, gender, phone, bloodGroup } = await request.json();

// Insert includes blood_group now:
  .insert({
    profile_id: newUserId,
    name: name.trim(),
    email: email.trim(),
    age: parseInt(age) || 30,
    gender,
+   blood_group: bloodGroup || 'O+',
    phone: phone?.trim() || ''
  })
```

---

### 🐛 Bug #2: No Edit/Delete Functionality for Patients

**Problem:** Admin could only register patients but had no way to edit or remove them.

**Fix Applied:**

- Created `/api/patient/[id]/route.ts` with `PUT` and `DELETE` handlers.
- Added Edit modal and Delete confirmation dialog in `PatientsPanel.tsx`.
- Wired callbacks in the admin dashboard page.

---

### 🐛 Bug #3: Hardcoded Dashboard Date

**File:** `src/app/admin/component/AdminDashboard.tsx`, Line 101

**Problem:** The date displays `Today: Oct 24, 2026` — hardcoded.

**Fix:**

```tsx
// Replace:
<span>Today: Oct 24, 2026</span>

// With:
<span>Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
```

--- // Fixed

### 🐛 Bug #4: Hardcoded Stats Values in AdminDashboard

**File:** `src/app/admin/component/AdminDashboard.tsx`, Lines 32-53

**Problem:** When no real data exists, the fallback values (`1,240`, `3,450`, `12`) are misleading. "Pending Reports" always shows `12`.

**Fix:** Derive all stats from actual data:

```tsx
const stats = [
  {
    title: 'Total Patients',
    value: patients?.length.toString() || '0',
    label: `${patients?.length || 0} active profiles`,
    // ...
  },
  {
    title: 'Pending Reports',
    value: reports.filter(r => r.title?.includes('Pending')).length.toString(),
    // ...
  }
];
```

--- // Fixed Done

### 🐛 Bug #5: Dual Supabase Client Pattern Conflict

**Problem:** Two different Supabase client factories exist:

1. `src/lib/supabase/index.ts` — Uses `localStorage` for config, standard `createClient`
2. `src/lib/supabase/client.ts` — Uses `createBrowserClient` from `@supabase/ssr`

Components import from both. This creates **session desync** — one client may be authenticated while the other is not.

**Fix:** Consolidate into a single client pattern:

```typescript
// Use ONLY @supabase/ssr for all client-side access
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    return createBrowserClient(supabaseUrl, supabaseKey);
};

// Remove or deprecate the localStorage-based client in index.ts
```

--- // Fixed

### 🐛 Bug #6: `motion/react` vs `framer-motion` Import Inconsistency

**Problem:** Some files import from `motion/react` and others from `framer-motion`. Both `motion` and `framer-motion` are in `package.json`.

**Files affected:**

- `AdminDashboard.tsx` → `motion/react`
- `PatientsPanel.tsx` → `motion/react`
- `dashboard/page.tsx` → `framer-motion`

**Fix:** Pick one. Since `motion` (v12) is the newer package, standardize:

```typescript
// ALL files should use:
import { motion, AnimatePresence } from 'motion/react';

// Remove framer-motion from package.json
```

--- // Fixed

### 🐛 Bug #7: Missing Error Handling on Patient Registration Form

**Problem:** If the Supabase connection fails, the form shows a generic error. There's no validation for email format, minimum age, or password strength.

**Fix:** Add client-side validation:

```typescript
if (age < 0 || age > 150) {
  setError('Please enter a valid age.');
  return;
}
if (password.length < 6) {
  setError('Password must be at least 6 characters.');
  return;
}
```

---

### 🐛 Bug #8: Memory Leak in Scan Progress Interval

**File:** `src/app/admin/component/AddReport.tsx`, Line 124-137

**Problem:** `setInterval` inside `handleFileSelected` updates state after component unmounts — classic React memory leak.

**Fix:** Use cleanup with `useEffect` or store interval in `useRef`:

```typescript
const intervalRef = useRef<NodeJS.Timeout | null>(null);

// In handleFileSelected:
intervalRef.current = setInterval(() => { ... });

// Cleanup on unmount:
useEffect(() => {
  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, []);
```

--- // Fixed

### 🐛 Bug #9: No RLS (Row Level Security) for DELETE Operations

**Problem:** The SQL setup in `index.ts` defines RLS policies for SELECT and INSERT but **no DELETE policy**. This means the delete API may fail silently with RLS enabled.

**Fix:** Add to your Supabase SQL:

```sql
CREATE POLICY "Admins can delete patients" ON patients FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update patients" ON patients FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

---

## 3. Scalability Bottlenecks

### ⚠️ Bottleneck #1: Client-Side Data Fetching for All Patients

**Current:** `fetchDashboardData()` fetches ALL patients and ALL reports on every page load.

**Impact at scale:** With 10,000+ patients and 50,000+ reports, this will:

- Cause 5-10 second load times
- Use excessive bandwidth
- Strain the Supabase free tier

**Solution:** Server-side pagination + cursor-based fetching:

```typescript
// Use server components or API route with pagination:
const { data } = await supabase
  .from('patients')
  .select('*', { count: 'exact' })
  .range(page * pageSize, (page + 1) * pageSize - 1)
  .order('created_at', { ascending: false });
```

--- // Fixed

### ⚠️ Bottleneck #2: No Server Components

**Current:** All pages use `"use client"` — everything is client-rendered.

**Impact:** No SEO benefits, no streaming, full JS bundle shipped to browser.

**Solution:** Use Next.js Server Components for data fetching:

```
src/app/admin/dashboard/
  page.tsx         → Server Component (fetches data)
  DashboardClient.tsx → Client Component (interactive UI)
```

--- // fixed

### ⚠️ Bottleneck #3: Image Optimization

**Current:** External Google CDN images loaded directly. No caching or lazy loading strategy.

**Solution:**

- Configure `next.config.ts` with proper `remotePatterns` for all domains
- Use `<Image>` with `priority` for above-fold, `loading="lazy"` for below-fold
- Consider uploading avatars to Supabase Storage for reliability

---

### ⚠️ Bottleneck #4: No Caching Strategy

**Current:** Every page navigation re-fetches all data from Supabase.

**Solution:** Implement SWR or React Query:

```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function useDashboardData() {
  const { data, error, mutate } = useSWR('/api/dashboard', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // 30s cache
  });
  return { data, error, refresh: mutate };
}
```

--- // Fixed

## 4. Recommended Scalable Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    CDN (Vercel Edge)                     │
│  Static assets, image optimization, edge caching         │
└───────────────────┬──────────────────────────────────────┘
                    │
┌───────────────────┴──────────────────────────────────────┐
│              Next.js Application                         │
│  ┌────────────────┐  ┌──────────────────────────────┐    │
│  │ Server Comps   │  │ Client Components            │    │
│  │ (Data Fetch)   │  │ (Interactive UI + State)     │    │
│  └────────┬───────┘  └──────────────┬───────────────┘    │
│           │                         │                    │
│  ┌────────┴─────────────────────────┴───────────────┐    │
│  │              API Routes (Route Handlers)         │    │
│  │  /api/patient     (CRUD)                         │    │
│  │  /api/reports     (CRUD + upload)                │    │
│  │  /api/dashboard   (aggregated stats)             │    │
│  │  /api/auth        (login/logout/register)        │    │
│  └──────────────────────┬───────────────────────────┘    │
└─────────────────────────┬────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────┴───────┐ ┌───────┴───────┐ ┌───────┴───────┐
│   Supabase    │ │   Redis       │ │   Object      │
│   PostgreSQL  │ │   (Cache +    │ │   Storage     │
│   (Primary DB)│ │    Sessions)  │ │   (PDFs)      │
└───────────────┘ └───────────────┘ └───────────────┘
```

### Key Architectural Decisions

| Decision | Current | Recommended |
|----------|---------|-------------|
| Rendering | 100% CSR | SSR + RSC + CSR hybrid |
| Data Fetching | Client-only `useEffect` | Server Components + SWR |
| State Management | `useState` per page | Zustand/Jotai global store |
| Caching | None | SWR with revalidation |
| Search | Client-side filter | PostgreSQL full-text search |
| Pagination | None (fetch all) | Cursor-based server-side |
| File Storage | Supabase Storage | Supabase Storage + CDN |
| Auth | Client-side tokens | Server-side middleware |
| Error Handling | `console.error` | Global error boundary + toast |
| Testing | None | Vitest + Playwright |

---

## 5. Database Optimizations

### Current Schema Issues & Fixes

#### a) Add Missing Indexes

```sql
-- Speed up patient lookups
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_profile_id ON patients(profile_id);

-- Speed up report queries
CREATE INDEX idx_reports_patient_id ON reports(patient_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Speed up report items lookup
CREATE INDEX idx_report_items_report_id ON report_items(report_id);
```

#### b) Add Constraints

```sql
-- Prevent duplicate emails
ALTER TABLE patients ADD CONSTRAINT unique_patient_email UNIQUE (email);

-- Ensure valid blood groups
ALTER TABLE patients ADD CONSTRAINT valid_blood_group 
  CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'));

-- Set default blood group
ALTER TABLE patients ALTER COLUMN blood_group SET DEFAULT 'O+';
```

#### c) Add Audit Trail

```sql
CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  changed_by UUID REFERENCES auth.users(id),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. Authentication & Security

### Current Security Issues

| Issue | Severity | Fix |
|-------|----------|-----|
| Password stored visible in form | 🔴 High | Use `type="password"` input |
| No CSRF protection | 🟡 Medium | Next.js middleware tokens |
| Admin check only on API routes | 🟡 Medium | Add middleware guard |
| No rate limiting | 🔴 High | Add rate limiter middleware |
| Supabase keys in client bundle | 🟡 Medium | Anon key is designed for this, but use RLS properly |
| No session expiry UI | 🟡 Medium | Auto-redirect on 401 |

### Recommended Security Middleware

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Create Supabase client with cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { /* cookie adapter */ } }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  // Protect patient routes
  if (request.nextUrl.pathname.startsWith('/patient/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/patient/login', request.url));
    }
  }
  
  return response;
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/patient/dashboard/:path*'],
};
```

### Rate Limiting (Simple In-Memory)

```typescript
// src/lib/rate-limit.ts
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(ip: string, limit = 60, windowMs = 60000): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) return false;
  record.count++;
  return true;
}
```

---

## 7. Performance Optimizations

### a) Code Splitting

```typescript
// Lazy load heavy modals
const AddReportModal = dynamic(() => import('../component/AddReport'), {
  loading: () => <div>Loading...</div>,
  ssr: false
});
```

### b) Optimize Re-renders

```typescript
// Use React.memo for patient cards
const PatientCard = React.memo(function PatientCard({ patient, onEdit, onDelete }) {
  // Component body
});

// Use useCallback for event handlers
const handleEditPatient = useCallback(async (patient: Patient) => {
  // ...
}, [fetchDashboardData]);
```

### c) Virtual Scrolling for Large Lists

```typescript
// For 1000+ patients, use virtualization
import { useVirtualizer } from '@tanstack/react-virtual';

function PatientsList({ patients }) {
  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: patients.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
  });
  // Render only visible items
}
```

### d) Debounced Search

```typescript
import { useDeferredValue } from 'react';

function PatientsPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);
  
  const filteredPatients = useMemo(() => 
    patients.filter(p => 
      p.name.toLowerCase().includes(deferredSearch.toLowerCase())
    ), [patients, deferredSearch]
  );
}
```

---

## 8. Deployment & DevOps

### Environment Structure

```
.env.local          → Local development
.env.staging        → Staging environment  
.env.production     → Production environment
```

### Recommended CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy MedLab Reports
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Monitoring

- **Error Tracking:** Sentry
- **Performance:** Vercel Analytics + Web Vitals
- **Database:** Supabase Dashboard monitoring
- **Uptime:** UptimeRobot or Better Uptime

---

## 9. Step-by-Step Roadmap

### Phase 1: Critical Bug Fixes (Week 1) ✅

- [x] Fix blood group not saving to database
- [x] Add Edit/Delete patient functionality
- [x] Default blood group to O+ with Rh factor
- [x] Fix hardcoded dashboard date
- [x] Fix motion/react vs framer-motion imports
- [x] Add missing RLS policies for UPDATE/DELETE
- [x] Fix memory leak in AddReport interval

### Phase 2: Security Hardening (Week 2)

- [x] Implement middleware auth guards
- [ ] Add rate limiting to API routes
- [ ] Add input validation (client + server)
- [ ] Add CSRF protection
- [x] Audit & fix all RLS policies
- [x] Add password field `type="password"`

### Phase 3: Performance (Week 3)

- [x] Add server-side pagination
- [x] Implement SWR/React Query caching
- [ ] Add code splitting with dynamic imports
- [x] Optimize images (lazy loading, sizing)
- [x] Add debounced search
- [x] Consolidate Supabase client pattern

### Phase 4: Scalable Features (Week 4-5)

- [x] Convert data-fetching pages to Server Components
- [ ] Add global state management (Zustand)
- [ ] Implement real-time subscriptions for reports
- [ ] Add database indexes
- [ ] Add audit trail logging
- [ ] Add error boundaries & toast notifications

### Phase 5: Production Readiness (Week 6)

- [ ] Add Vitest unit tests
- [ ] Add Playwright E2E tests
- [ ] Set up CI/CD pipeline
- [ ] Configure Sentry error tracking
- [ ] Add Vercel Analytics
- [ ] Database backup strategy
- [ ] Load testing with k6

---

## 📊 Quick Reference: Priority Matrix

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| P0 | Missing RLS DELETE/UPDATE policies | Low | 🔴 Security breach |
| P0 | Rate limiting on APIs | Medium | 🔴 DDoS vulnerability |
| P1 | Blood group persistence | Low | 🟡 Data integrity |
| P1 | Edit/Delete patients | Medium | 🟡 Core feature gap |
| P1 | Pagination | Medium | 🟡 Performance at scale |
| P2 | Caching (SWR) | Low | 🟢 Performance |
| P2 | Server Components | Medium | 🟢 SEO + Performance |
| P2 | Virtual scrolling | Low | 🟢 UX at scale |
| P3 | Error boundaries | Low | 🟢 Resilience |
| P3 | Testing suite | High | 🟢 Quality assurance |

---

> 💡 **Key Takeaway:** The current architecture works well for a small-scale lab (< 500 patients). To scale beyond 5,000+ patients, prioritize: **server-side pagination → caching → Server Components → database indexing**. The security fixes (RLS, rate limiting, middleware) should be done before any public deployment.
