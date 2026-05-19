"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import mqtt, { MqttClient } from "mqtt";
import { useDevice } from "@/contexts/device-context";
import { useMqttStatus } from "@/hooks/use-mqtt-status";
import { CommandPayload, IoTData } from "@/utils/iot-data";

interface MqttContextType {
  isOnline: boolean; // Status untuk device aktif
  latestData: IoTData | null;
  rawHistory: IoTData[];
  lastActionData: IoTData | null;
  sendCommand: (payload: CommandPayload) => void;
  pingDevice: (deviceId: string) => Promise<boolean>;
  globalOnlineMap: Record<string, boolean>; 
}

const MqttContext = createContext<MqttContextType | null>(null);

export function MqttProvider({ children }: { children: React.ReactNode }) {
  const { activeDevice } = useDevice();
  const activeId = activeDevice?.deviceId || null;

  const mqttStatus = useMqttStatus(activeId);

  const [globalOnlineMap, setGlobalOnlineMap] = useState<Record<string, boolean>>({});
  const globalClientRef = useRef<MqttClient | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_MQTT_API_URL;
    if (!url) return;

    // Koneksi khusus untuk memantau status online/offline semua device
    const client = mqtt.connect(url);
    globalClientRef.current = client;

    client.on("connect", () => {
      client.subscribe("jemuran/+/status"); // Hanya subscribe topik status (ringan)
    });

    client.on("message", (topic, payload) => {
      const parts = topic.split("/");
      if (parts.length >= 3 && parts[2] === "status") {
        const id = parts[1];
        const isDeviceOnline = payload.toString().includes("Online");
        
        setGlobalOnlineMap((prev) => ({
          ...prev,
          [id]: isDeviceOnline,
        }));
      }
    });

    return () => {
      client.end(true);
    };
  }, []);

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