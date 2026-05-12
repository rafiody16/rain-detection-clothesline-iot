"use client";

import { connectMQTT } from "@/utils/mqtt";
import { useState, useEffect } from "react";
// Import helper MQTT Anda di sini

export function useMqttStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [latestData, setLatestData] = useState<any>(null);
  const [rawHistory, setRawHistory] = useState<any[]>([]);

  const normalize = (item: any) => ({
    timestampValue: Date.now(),
    suhu: item.suhu ?? item.temperature ?? 0,
    lembab: item.lembab ?? item.humidity ?? 0,
    ldr: item.ldr ?? item.light ?? 0,
    hujan: item.hujan ?? item.rain ?? false,
  });

  useEffect(() => {
    let lastDataTimestamp = Date.now();

    // Cek setiap 5 detik, jika data terakhir > 10 detik, anggap offline
    const heartbeatCheck = setInterval(() => {
      const now = Date.now();
      if (now - lastDataTimestamp > 10000) {
        setIsOnline(false);
      }
    }, 5000);

    // Ganti 'connectMQTT' dengan fungsi koneksi yang Anda gunakan
    const client = connectMQTT((topic, message) => {
      const msgStr = message.toString();

      // Logika Topik Status
      if (topic === 'jemuran/status') {
        if (msgStr.includes("Online")) {
          setIsOnline(true);
          lastDataTimestamp = Date.now();
        } else if (msgStr.includes("Offline")) {
          setIsOnline(false);
        }
      }

      // Logika Topik Data
      if (topic === 'jemuran/data') {
        lastDataTimestamp = Date.now();
        setIsOnline(true);
        try {
          const parsed = JSON.parse(msgStr);
          const normalized = normalize(parsed);
          // console.log("Received MQTT Data:", parsed);
          // console.log("Normalized Data:", normalized);
          setLatestData(normalized);
          // console.log("Updated latestData:", latestData)
          setRawHistory((prev) => [...prev, normalized].slice(-200));
          // console.log("Updated rawHistory length:", rawHistory)
        } catch (e) {
          console.error("MQTT Parse Error:", e);
        }
      }
    });

    return () => {
      clearInterval(heartbeatCheck);
      client?.end(true);
    };
  }, []);

  return { isOnline, latestData, rawHistory };
}