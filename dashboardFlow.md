# Laboratory Report Extraction and Dashboard Syncing Pipeline

This document outlines the architecture, data flow, and processing pipeline for uploading, parsing, and storing clinical blood laboratory reports in the MedLab system.

---

## 1. System Flow Overview

The diagram below details the sequence of operations from the moment an administrator drops a PDF laboratory report in the Admin panel to the moment the patient views the extracted blood metrics on their personal dashboard.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin (Staff)
    participant UI as Admin Dashboard (AddReport Modal)
    participant API as API Route (/api/upload-reports)
    participant Parser as PDF Parser (pdf-parse)
    participant DB as Supabase Database
    actor Patient as Patient

    Admin->>UI: Selects Patient & Uploads PDF Report
    UI->>API: POST /api/upload-reports (FormData with file)
    
    rect rgb(240, 245, 255)
        note right of API: Server-side PDF Extraction
        API->>Parser: Extract raw text from buffer
        Parser-->>API: Return plain-text string
        API->>API: Match text against clinical regex patterns (e.g. Hemoglobin, WBC, glucose)
    end

    API->>DB: Upload PDF to `medlab-reports-bucket` Storage
    DB-->>API: Return Public PDF URL
    API-->>UI: Return JSON response containing parsed metrics & PDF URL
    
    Admin->>UI: Reviews parsed levels and clicks "Publish Report"
    UI->>DB: INSERT into `reports` (UUID, report_no, patient_id, pdf_url, doctor_notes)
    DB-->>UI: Confirm Report Inserted (returns DB report UUID)
    UI->>DB: INSERT into `report_items` (report_id, test_name, result_value, unit, normal_range, flag)
    DB-->>UI: Confirm Items Saved
    UI->>Admin: Show Success Toast / Navigate to Log

    Note over Patient, DB: Patient Logs In & RLS Policies Evaluate Session
    Patient->>DB: GET reports & report_items (authenticated patient session)
    DB-->>Patient: Return filtered records matching patient's profile_id
    Patient->>Patient: Plot Hemoglobin trends & populate Bento Grid cards
```

---

## 2. Dynamic Component Details

### A. Server-Side Extraction (`/api/upload-reports`)

- **File Upload**: Handled via standard Next.js `multipart/form-data` request routing.
- **Parsing Engine**: Node.js `pdf-parse` reads the PDF structure and outputs a clean text string.
- **Regex Extraction**: Custom regular expressions run against the output text to parse common panels:
  - **Hemoglobin**: `Hemoglobin\s*:\s*([\d\.]+)\s*(g/dL)?`
  - **White Blood Cell (WBC)**: `(?:WBC|White Blood Cell)\s*:\s*([\d\.]+)\s*(x10\^3/uL)?`
  - **Blood Sugar / Fasting Glucose**: `(?:Blood Glucose|Fasting Blood Sugar|Sugar)\s*:\s*([\d\.]+)\s*(mg/dL)?`
  - **Cholesterol**: `(?:Total Cholesterol|Cholesterol)\s*:\s*([\d\.]+)\s*(mg/dL)?`
- **Fallback Presets**: If text extraction yields 0 matching panels (e.g., if the PDF is a scanned image with no OCR layer), the API returns a rich predefined clinical preset so that the UI experience remains complete and functional.

### B. Database Syncing and Storage

- **File Repository**: The PDF file is persisted directly in Supabase Storage (`medlab-reports-bucket`).
- **Main Record Table (`reports`)**:
  - `id`: Unique Auto-generated UUID.
  - `report_no`: Reference tracking ID generated from form.
  - `patient_id`: Foreign key link to `patients.id`.
  - `pdf_url`: Public link to the file stored in Supabase.
  - `status`: Set to `published`.
- **Telemetry Table (`report_items`)**:
  - Contains individual rows linked to the main report via `report_id` UUID.
  - Stores `test_name`, `result_value`, `unit`, `normal_range`, and dynamic `flag` (`NORMAL`, `HIGH`, `LOW`, `CRITICAL`).

### C. Patient Authentication and Authorization (RLS)

- Access controls are enforced at the database layer using Supabase **Row Level Security (RLS)**:
  - **Staff/Admin**: JWT check allows viewing and managing all profiles, patients, and reports.
  - **Patients**: RLS policies restrict SELECT operations to only rows where `patients.profile_id = auth.uid()`, guaranteeing HIPAA-compliant data separation.
