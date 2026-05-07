"use client"
import { useEffect, useState } from "react";
import HistoryPage from "@/components/dashboard/history";

const History = () => {
    const [logs, setLogs] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            const res = await fetch("/api/iot");
            if (!res.ok) return;
            const data = await res.json();
            if (Array.isArray(data)) {
                const formattedData = data.map((item: any) => ({
                    timestamp: item.timestamp ?? "-",
                    temperature: item.suhu ?? item.temperature ?? 0,
                    humidity: item.lembab ?? item.humidity ?? 0,
                    light: item.ldr ?? item.light ?? 0,
                    rain: item.hujan ?? item.rain ?? false,
                }));

                const sorted = formattedData.sort((a, b) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
                setLogs(sorted);
            }
        } catch (err) {
            console.error("Error fetching logs:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const id = setInterval(fetchLogs, 5000);
        return () => clearInterval(id);
    }, []);

    return (
        <HistoryPage logs={logs} isLoading={isLoading} />
    )
}

export default History