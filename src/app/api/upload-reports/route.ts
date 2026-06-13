import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { PDFParse } from 'pdf-parse';
import { ReportItem } from '@/types';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Parse PDF text using PDFParse class
        let pdfText = '';
        try {
            const parser = new PDFParse({ data: buffer });
            const result = await parser.getText();
            pdfText = result.text || '';
        } catch (parseError) {
            console.error('pdf-parse error:', parseError);
        }

        // Upload the PDF file to Supabase storage bucket
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const filePath = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('medlab-reports-bucket')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        let publicUrl = '';
        if (!uploadError && uploadData) {
            const { data } = supabase.storage
                .from('medlab-reports-bucket')
                .getPublicUrl(filePath);
            publicUrl = data.publicUrl;
        } else {
            console.error('Storage upload error:', uploadError?.message);
        }

        // Standard clinical test definitions for parsing
        const testStandards = [
            { key: 'hemoglobin', min: 13.5, max: 17.5, unit: 'g/dL', name: 'Hemoglobin (Hb)' },
            { key: 'glucose', min: 70, max: 100, unit: 'mg/dL', name: 'Fasting Blood Sugar' },
            { key: 'sugar', min: 70, max: 100, unit: 'mg/dL', name: 'Fasting Blood Sugar' },
            { key: 'cholesterol', min: 120, max: 200, unit: 'mg/dL', name: 'Total Cholesterol' },
            { key: 'triglycerides', min: 30, max: 150, unit: 'mg/dL', name: 'Triglycerides' },
            { key: 'ldl', min: 0, max: 100, unit: 'mg/dL', name: 'LDL Cholesterol' },
            { key: 'hdl', min: 40, max: 60, unit: 'mg/dL', name: 'HDL Cholesterol' },
            { key: 'wbc', min: 4.5, max: 11.0, unit: 'x10³/µL', name: 'White Blood Cell (WBC)' },
            { key: 'white blood', min: 4.5, max: 11.0, unit: 'x10³/µL', name: 'White Blood Cell (WBC)' },
            { key: 'rbc', min: 4.0, max: 5.2, unit: 'x10⁶/µL', name: 'Red Blood Cells (RBC)' },
            { key: 'red blood', min: 4.0, max: 5.2, unit: 'x10⁶/µL', name: 'Red Blood Cells (RBC)' },
            { key: 'platelets', min: 150, max: 450, unit: 'k/µL', name: 'Platelets' }
        ];

        const parsedItems: ReportItem[] = [];
        const lines = pdfText.split('\n');

        for (const line of lines) {
            const cleanLine = line.toLowerCase();
            for (const standard of testStandards) {
                if (cleanLine.includes(standard.key)) {
                    const numMatch = line.match(/(\d+(?:\.\d+)?)/);
                    if (numMatch) {
                        const result = parseFloat(numMatch[1]);
                        let status: 'NORMAL' | 'BORDERLINE' | 'HIGH' | 'LOW' | 'CRITICAL' = 'NORMAL';

                        if (result > standard.max) {
                            status = (result > standard.max * 1.25) ? 'CRITICAL' : 'HIGH';
                        } else if (result < standard.min) {
                            status = (result < standard.min * 0.75) ? 'CRITICAL' : 'LOW';
                        }

                        if (!parsedItems.some(item => item.name === standard.name)) {
                            parsedItems.push({
                                id: `ocr-${Math.random().toString(36).substr(2, 9)}`,
                                name: standard.name,
                                result,
                                unit: standard.unit,
                                minNormal: standard.min,
                                maxNormal: standard.max,
                                status
                            });
                        }
                    }
                }
            }
        }

        // Determine title
        let title = 'Custom Blood Diagnostics';
        if (pdfText.toLowerCase().includes('lipid')) {
            title = 'Lipid Profile & Glucose';
        } else if (pdfText.toLowerCase().includes('anemi') || pdfText.toLowerCase().includes('iron')) {
            title = 'Iron & Hematological Profile';
        } else if (pdfText.toLowerCase().includes('wellness') || pdfText.toLowerCase().includes('general')) {
            title = 'General Wellness Panel';
        }

        return NextResponse.json({
            success: true,
            title,
            referrer: 'Dr. Sarah Miller',
            items: parsedItems,
            pdf_url: publicUrl
        });

    } catch (error) {
        console.error("PDF upload/extract error:", error);
        return NextResponse.json({ success: false, message: "Failed to parse PDF", details: String(error) }, { status: 500 });
    }
}
