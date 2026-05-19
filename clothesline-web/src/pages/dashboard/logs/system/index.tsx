"use client"

import { useEffect, useState } from "react";
import SystemLogsPage from "../../../../views/dashboard/logs/system";
import { connectMQTT } from "@/utils/mqtt";
import DashboardLayout from "../../../../views/dashboard/layout";
import { useDevice } from "@/contexts/device-context";


const SystemLogs = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [weatherData, setWeatherData] = useState<any>(null);

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