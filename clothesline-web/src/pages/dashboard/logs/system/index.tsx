"use client"

import { useEffect, useState } from "react";
import SystemLogsPage from "../../../../views/dashboard/logs/system";
import { connectMQTT } from "@/utils/mqtt";
import DashboardLayout from "../../../../views/dashboard/layout";
import { useDevice } from "@/contexts/device-context";

interface SystemLog {
    id: string;
    timestamp: string;
    level: "INFO" | "DEBUG" | "EVENT" | "ERROR";
    message: string;
}

const SystemLogs = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [weatherData, setWeatherData] = useState<any>(null);
    // Simpan logs per device ID untuk support multiple devices
    const [logsByDevice, setLogsByDevice] = useState<Record<string, SystemLog[]>>({});
    const { activeDevice } = useDevice();
    const deviceId = activeDevice?.deviceId || null;

    // Ambil logs hanya untuk device yang aktif saat ini
    const currentLogs = deviceId ? (logsByDevice[deviceId] || []) : [];

    useEffect(() => {
        // Hentikan eksekusi jika tidak ada device yang dipilih
        if (!deviceId) return;

        // Masukkan deviceId sebagai parameter pertama
        const client = connectMQTT(deviceId, (topic, message) => {
            const rawMessage = message.toString();

            // Ubah string topic menjadi format dinamis (Template Literals)
            if (topic === `jemuran/${deviceId}/status`) {
                let detectedLevel: SystemLog["level"] = "EVENT";
                if (rawMessage.includes("ERROR")) detectedLevel = "ERROR";
                else if (rawMessage.includes("INFO")) detectedLevel = "INFO";
                else if (rawMessage.includes("DEBUG")) detectedLevel = "DEBUG";
                const cleanMessage = rawMessage.replace(/ERROR:|INFO:|DEBUG:|EVENT:/g, "").trim();

                setLogsByDevice((prevAll) => {
                    const prev = prevAll[deviceId] || [];
                    if (prev.length > 0 && prev[0].message === cleanMessage) {
                        const updatedLogs = [...prev];
                        updatedLogs[0] = {
                            ...updatedLogs[0],
                            timestamp: new Date().toLocaleTimeString('id-ID')
                        };
                        return { ...prevAll, [deviceId]: updatedLogs };
                    }
                    const newEntry: SystemLog = {
                        id: Date.now().toString(),
                        timestamp: new Date().toLocaleTimeString('id-ID'),
                        level: detectedLevel,
                        message: cleanMessage,
                    };
                    const updated = [newEntry, ...prev].slice(0, 50);
                    return { ...prevAll, [deviceId]: updated };
                });
            } else if (topic === `jemuran/${deviceId}/data`) {
                try {
                    const parsed = JSON.parse(rawMessage);
                    setWeatherData(parsed);
                } catch (e) {
                    console.error("Gagal parsing JSON cuaca", e);
                }
            }
        });

        return () => {
            if (client) client.end(true); // Parameter true untuk force disconnect saat unmount
        };
    }, [deviceId]); // Daftarkan deviceId sebagai dependency

    const breadcrumbs = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "System Logs" },
    ];

    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <SystemLogsPage logs={currentLogs} deviceId={deviceId} />
        </DashboardLayout>
    );
}

export default SystemLogs;