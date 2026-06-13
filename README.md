# 🔬 MedLab Reports — Pathology LIS

MedLab Reports is a modern, high-performance pathology Laboratory Information System (LIS) built with **Next.js 16 (App Router)** and **Supabase**. It provides real-time diagnostic reporting, patient profile administration, and electronic health record access.

---

## 🚀 Key Features

*   **Admin Dashboard**: Real-time diagnostic statistics, automatic clinical alerts for critical values, and aggregate patient count telemetry.
*   **Patient Profile Management**: Complete CRUD operations for clinical patient profiles, search capability, and pagination.
*   **Dynamic Report Generation**: Electronic publication of blood panels, lipid profiles, and diagnostic chemistry with PDF attachments.
*   **Secure Patient Dashboard**: Dedicated portal for patients to view, search, and download released laboratory reports.

---

## 🏗️ Architecture & Performance Optimizations

The system is engineered for low latency, security, and scalability under high data volumes:

*   **⚡ Client-Side Caching (SWR)**: Implemented SWR query caching across both Admin and Patient dashboards. Page transitions, active searching, and paginated navigation load instantly using cached telemetry, drastically decreasing DB read volume.
*   **🏎️ Hybrid Server & Client Rendering (RSC)**: Initial stats and records are resolved server-side in Next.js Server Components. These are passed as `fallbackData` to client-side components to eliminate layout flashes and guarantee instant paint times.
*   **📊 Server-Side Pagination & Search**: Query execution limits are pushed to the database level (10 records per page) with full-text fuzzy searching to minimize bandwidth and memory overhead.
*   **🖼️ Image Optimization**: Uses Next.js `<Image>` with explicit width/height parameters, layout preservation, and lazy loading strategies.
*   **🔐 Consolidated Auth Session Client**: Standardized on `@supabase/ssr` across all routes and client views to prevent session desynchronization.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 16 (App Router + React 19)
*   **Database & Auth**: Supabase Cloud (PostgreSQL + Auth + Storage)
*   **Caching**: SWR (Stale-While-Revalidate)
*   **Styling**: Tailwind CSS v4 (Sleek dark mode + custom colors)
*   **Animations**: Motion (`motion/react`)
*   **Icons**: Lucide React

---

## 📦 Getting Started

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 3. Launch Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

### 4. Build for Production

```bash
npm run build
```

---

## 📄 Documentation References

For more detailed technical analysis:
*   [Scalable Architecture & Roadmap](file:///c:/Users/harir/Desktop/medlabs-report/ScalableArchitecture.md)
*   [Walkthrough of Completed Fixes](file:///C:/Users/harir/.gemini/antigravity-ide/brain/e6db0b51-b667-4fd5-8e16-6747fdd43d98/walkthrough.md)
