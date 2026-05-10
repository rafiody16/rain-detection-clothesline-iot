"use client"

import { useEffect, useState } from "react";
import SystemLogsPage from "@/components/dashboard/logs/system";
import { connectMQTT } from "@/utils/mqtt";

interface SystemLog {
    id: string;
    timestamp: string;
    level: "INFO" | "DEBUG" | "EVENT" | "ERROR";
    message: string;
}

const SystemLogs = () => {
    const [weatherData, setWeatherData] = useState<any>(null);
    const [logs, setLogs] = useState<SystemLog[]>([]);

    useEffect(() => {
        const client = connectMQTT((topic, message) => {
            const rawMessage = message.toString();

            if (topic === 'jemuran/status') {
                let detectedLevel: SystemLog["level"] = "EVENT";
                if (rawMessage.includes("ERROR")) detectedLevel = "ERROR";
                else if (rawMessage.includes("INFO")) detectedLevel = "INFO";
                else if (rawMessage.includes("DEBUG")) detectedLevel = "DEBUG";
                const cleanMessage = rawMessage.replace(/ERROR:|INFO:|DEBUG:|EVENT:/g, "").trim();

                setLogs((prev: SystemLog[]): SystemLog[] => {
                    if (prev.length > 0 && prev[0].message === cleanMessage) {
                        const updatedLogs = [...prev];
                        updatedLogs[0] = {
                            ...updatedLogs[0],
                            timestamp: new Date().toLocaleTimeString('id-ID')
                        };
                        return updatedLogs;
                    }
                    const newEntry: SystemLog = {
                        id: Date.now().toString(),
                        timestamp: new Date().toLocaleTimeString('id-ID'),
                        level: detectedLevel,
                        message: cleanMessage,
                    };
                    return [newEntry, ...prev].slice(0, 50);
                });
            } else if (topic === 'jemuran/data') {
                try {
                    const parsed = JSON.parse(rawMessage);
                    setWeatherData(parsed);
                } catch (e) {
                    console.error("Gagal parsing JSON cuaca", e);
                }
            }
        });

        return () => {
            if (client) client.end();
        };
    }, []);

    return <SystemLogsPage logs={logs} />;
}

export default SystemLogs;