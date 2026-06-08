"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import mqtt, { MqttClient } from "mqtt";
import { useDevice } from "@/contexts/device-context";
import { useMqttStatus } from "@/hooks/use-mqtt-status";
import { CommandPayload, IoTData } from "@/utils/iot-data";

interface MqttContextType {
  isOnline: boolean; 
  latestData: IoTData | null;
  rawHistory: IoTData[];
  lastActionData: IoTData | null;
  sendCommand: (payload: CommandPayload) => void;
  pingDevice: (deviceId: string) => Promise<boolean>;
  globalOnlineMap: Record<string, boolean>;
}

const MqttContext = createContext<MqttContextType | null>(null);


async function triggerTelegramNotif(pesanJemuran: string) {
  try {
    const response = await fetch("/api/telegram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `📢 *NOTIFIKASI JEMURAN PINTAR*\n\n*Status:* ${pesanJemuran}\n*Waktu:* ${new Date().toLocaleTimeString("id-ID")} WIB`,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      console.error("API Telegram gagal mengirim pesan:", data);
    }
  } catch (err) {
    console.error("Gagal memicu API Route /api/telegram:", err);
  }
}

export function MqttProvider({ children }: { children: React.ReactNode }) {
  const { activeDevice } = useDevice();
  const activeId = activeDevice?.deviceId || null;

  const mqttStatus = useMqttStatus(activeId);

  const [globalOnlineMap, setGlobalOnlineMap] = useState<Record<string, boolean>>({});
  const globalClientRef = useRef<MqttClient | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_MQTT_API_URL;
    if (!url) return;

    const client = mqtt.connect(url);
    globalClientRef.current = client;

    client.on("connect", () => {
      client.subscribe("jemuran/+/status"); 
    });

    client.on("message", (topic, payload) => {
      const parts = topic.split("/");
      if (parts.length >= 3 && parts[2] === "status") {
        const id = parts[1];
        const rawMessage = payload.toString();
        const isDeviceOnline = rawMessage.includes("Online");
        
        setGlobalOnlineMap((prev) => ({
          ...prev,
          [id]: isDeviceOnline,
        }));

        // === LOGIKA TAMBAHAN: Kirim ke Telegram jika menerima EVENT ===
        if (rawMessage.startsWith("EVENT:")) {
          const cleanMessage = rawMessage.replace("EVENT:", "").trim();
          
          // Ambil data sensor saat ini dari mqttStatus
          const currentData = mqttStatus.latestData;
          
          // Susun teks sensor jika datanya ada
          const teksSensor = currentData 
            ? `\n• Suhu: ${currentData.suhu ?? currentData.suhu ?? "-"}°C\n• Kelembapan: ${currentData.lembab ?? currentData.lembab ?? "-"}%\n• Cahaya: ${currentData.ldr ?? currentData.ldr ?? "-"} lux`
            : " Belum ada data";

          // Gabungkan string pesan lu dengan teks sensor sebelum dikirim
          const pesanGabungan = `${cleanMessage}\n\n📊 *DATA SENSOR:*${teksSensor}`;
          
          triggerTelegramNotif(pesanGabungan);
        }
      }
    });

    return () => {
      client.end(true);
    };
  }, [mqttStatus.latestData]); 

  return (
    <MqttContext.Provider value={{ ...mqttStatus, globalOnlineMap }}>
      {children}
    </MqttContext.Provider>
  );
}

export const useMqtt = () => {
  const context = useContext(MqttContext);
  if (!context) throw new Error("useMqtt must be used within MqttProvider");
  return context;
};