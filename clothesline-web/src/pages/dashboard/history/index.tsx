"use client";

import { useMemo, useState } from "react";
import HistoryPage from "@/views/dashboard/history";
import DashboardLayout from "@/views/dashboard/layout";
import { useDevice } from "@/contexts/device-context";
import { useFirebase } from "@/contexts/firebase-context";

function HistoryContent() {
    const { activeDevice } = useDevice();
    const { historyData, isLoading } = useFirebase();
    const [date, setDate] = useState<Date | undefined>(undefined);

    const logs = useMemo(() => {
        return historyData.map((item) => ({
            id: `${item.timestampValue}`,
            timestamp: item.rawTimestamp || item.timestamp,
            temperature: item.suhu,
            humidity: item.lembab,
            light: item.ldr,
            rain: item.status,
        }));
    }, [historyData]);

    return (
        <HistoryPage
            logs={logs}
            isLoading={isLoading}
            date={date}
            onDateChange={setDate}
            deviceName={activeDevice?.name}
        />
    );
}

const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "History" },
];

export default function History() {
    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <HistoryContent />
        </DashboardLayout>
    );
}