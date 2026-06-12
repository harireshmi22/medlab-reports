import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin - MedLab Reports",
    description: "Admin - MedLab Reports",
};

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>{children}</>;
}
