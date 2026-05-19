"use client"

import SystemLogsPage from "@/views/dashboard/logs/system";
import DashboardLayout from "@/views/dashboard/layout";


const SystemLogs = () => {

    const breadcrumbs = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "System Logs" },
    ];

    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <SystemLogsPage />
        </DashboardLayout>
    );
}

export default SystemLogs;