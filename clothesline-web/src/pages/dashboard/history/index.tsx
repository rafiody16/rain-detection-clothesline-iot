"use client"
import { useEffect, useState } from "react";
import HistoryPage from "@/components/dashboard/history";
import { format } from "date-fns";

const History = () => {
    const [logs, setLogs] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [date, setDate] = useState<Date | undefined>(new Date());

    useEffect(() => {
        let cancelled = false;

        const fetchLogs = async () => {
            try {
                const res = await fetch("/api/iot");
                if (!res.ok) return;

                const data = await res.json();
                if (!Array.isArray(data)) return;

                const sorted = data
                    .map((item: any) => ({
                        timestamp: item.timestamp ?? "-",
                        temperature: item.suhu ?? item.temperature ?? 0,
                        humidity: item.lembab ?? item.humidity ?? 0,
                        light: item.ldr ?? item.light ?? 0,
                        rain: item.hujan ?? item.rain ?? false,
                    }))
                    .filter((item)=> item.timestamp !== null && item.timestamp !== undefined && item.timestamp !== "-"  )
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                if (!cancelled) setLogs(() => sorted);
            } catch (err) {
                console.error("Error fetching logs:", err);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        fetchLogs();
        const id = setInterval(fetchLogs, 5000);

        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, []);

    return (
        <HistoryPage logs={logs} isLoading={isLoading} date={date} onDateChange={setDate} />
    )
}

export default History