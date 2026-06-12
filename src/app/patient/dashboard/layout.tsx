import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Patient Dashboard - MedLabs",
    description: "MedLabs Patient Dashboard",
};

export default function PatientDashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>{children}</>;
}
