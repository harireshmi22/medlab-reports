"use client";

import { useEffect, useState } from "react";

interface PatientApiReport {
    id: string;
    title: string;
    report_no: string;
    created_at: string;
}

export default function PatientReportsPage() {
    const [reports, setReports] = useState<PatientApiReport[]>([]);
    const [patient, setPatient] = useState<{ name: string; patient_no: string } | null>(null);

    useEffect(() => {
        async function getReports() {
            const res = await fetch("/api/patient/reports?page=1&limit=10");
            const data = await res.json();

            setPatient(data.patient);
            setReports(data.reports || []);
        }

        getReports();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">My Reports</h1>

            {patient && (
                <p className="mt-2 text-gray-600">
                    Patient: {patient.name} | ID: {patient.patient_no}
                </p>
            )}

            <div className="mt-6 space-y-4">
                {reports.map((report) => (
                    <div
                        key={report.id}
                        className="rounded-xl border p-4 shadow-sm"
                    >
                        <h2 className="font-semibold">{report.title}</h2>

                        <p className="text-sm text-gray-500">
                            Report No: {report.report_no}
                        </p>

                        <p className="text-sm text-gray-500">
                            Date: {new Date(report.created_at).toLocaleDateString()}
                        </p>

                        <a
                            href={`/api/patient/reports/${report.id}/download`}
                            target="_blank"
                            className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white"
                        >
                            View Report
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}