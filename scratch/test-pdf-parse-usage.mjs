import { PDFParse } from 'pdf-parse';
import * as fs from 'fs';

async function test() {
  try {
    // Let's create a dummy PDF buffer or read a real one if available
    // Since we don't have a real one, let's create a minimal PDF format buffer
    const dummyPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [ 3 0 R ] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [ 0 0 612 792 ] /Contents 4 0 R /Resources << >> >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n72 712 Td\n(Hemoglobin: 14.5 g/dL) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000220 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n313\n%%EOF\n');
    
    const parser = new PDFParse({ data: dummyPdfBuffer });
    console.log("Instantiated parser.");
    
    const result = await parser.getText();
    console.log("Extracted text:", JSON.stringify(result.text));
  } catch (err) {
    console.error("Error during execution:", err);
  }
}

test();
