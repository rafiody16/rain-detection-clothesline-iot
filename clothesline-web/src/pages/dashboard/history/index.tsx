"use client";

import HistoryPage from "@/views/dashboard/history";
import DashboardLayout from "@/views/dashboard/layout";

export default function History() {
    const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "History" },
];
    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <HistoryPage/>
        </DashboardLayout>
    );
}