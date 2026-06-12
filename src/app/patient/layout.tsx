import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Patient Portal - MedLabs",
    description: "MedLabs Patient Portal",
};

export default function PatientLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>{children}</>;
}
