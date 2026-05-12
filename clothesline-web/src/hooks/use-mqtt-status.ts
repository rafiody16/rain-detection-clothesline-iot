"use client";

import { connectMQTT } from "@/utils/mqtt";
import { useState, useEffect } from "react";

export function useMqttStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [latestData, setLatestData] = useState<any>(null);
  const [rawHistory, setRawHistory] = useState<any[]>([]);
  const [jemuranStatus, setJemuranStatus] =useState("UNKNOWN");
  const [lastActionTime, setLastActionTime] = useState<number | null>(null);

  const normalize = (item: any) => ({
    timestampValue: Date.now(),
    suhu: item.suhu ?? item.temperature ?? 0,
    lembab: item.lembab ?? item.humidity ?? 0,
    ldr: item.ldr ?? item.light ?? 0,

    // Tambahkan properti intensitasAir
    intensitasAir:
      item.intensitasAir ??
      item.intensitas_air ??
      item.rainIntensity ??
      item.rain_intensity ??
      0,

  });

  // Mapping status MQTT → UI
  const mapStatus = (message: string) => {
    if (message.includes("PROSES MASUK")) {
      return "MENUTUP";
    }

    if (message.includes("MASUK")) {
      return "TERTUTUP";
    }

    if (message.includes("PROSES KELUAR")) {
      return "MEMBUKA";
    }

    if (message.includes("KELUAR")) {
      return "TERBUKA";
    }

    return "UNKNOWN";
  };

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
      if (topic === "jemuran/status") {

        if (msgStr.includes("Online")) {
          setIsOnline(true);
          lastDataTimestamp = Date.now();

        } else if (msgStr.includes("Offline")) {
          setIsOnline(false);
        }

        // update status UI
        const status = mapStatus(msgStr);

        if (status !== "UNKNOWN") {
          setJemuranStatus(status);
          setLastActionTime(Date.now());
        }
      }

      // Logika Topik Data
      if (topic === "jemuran/data") {
        lastDataTimestamp = Date.now();
        setIsOnline(true);

        try {
          const parsed = JSON.parse(msgStr);
          const normalized = normalize(parsed);

          setLatestData(normalized);
          setRawHistory((prev) =>
            [...prev, normalized].slice(-200)
          );
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

  return { isOnline, latestData, rawHistory, jemuranStatus, lastActionTime };
}