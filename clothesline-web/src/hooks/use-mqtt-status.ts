"use client";

import { connectMQTT } from "@/utils/mqtt";
import { CommandPayload, IoTData, normalizeIoTData } from "@/utils/iot-data";
import { useState, useEffect, useRef } from "react";
import { useFirebase } from "@/contexts/firebase-context";

export function useMqttStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [latestData, setLatestData] = useState<IoTData | null>(null);
  const [rawHistory, setRawHistory] = useState<IoTData[]>([]);
  const [lastActionData, setLastActionData] = useState<IoTData | null>(null);

  const mqttClientRef = useRef<any>(null);
  
  const { historyData, isLoading } = useFirebase();


  useEffect(() => {
    if (!isLoading && historyData.length > 0 && lastActionData === null) {
      const currentData = historyData[0];
      let actualFirstAction = currentData;

      for (let i = 1; i < historyData.length; i++) {
        const item = historyData[i];
        if (item.mode === currentData.mode && item.status === currentData.status) {
          actualFirstAction = item;
        } else {
          break;
        }
      }

      const timeoutId = setTimeout(() => {
        setLastActionData(actualFirstAction);
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [historyData, isLoading, lastActionData]);

  const normalize = (item: any) => normalizeIoTData(item);

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

        } else if (msgStr.includes("Offline")) {
          setIsOnline(false);
        }
      }

      // Logika Topik Data
      if (topic === "jemuran/data") {
        setIsOnline(true);
        lastDataTimestamp = Date.now();

        try {
          const parsed = JSON.parse(msgStr);
          const normalized = normalize(parsed);

          setLatestData(normalized);
          setRawHistory((prev) =>
            [...prev, normalized].slice(-200)
          );
          setLastActionData((prev: IoTData | null) => {
            if(!prev) return normalized;
            if (
              normalized.mode !== prev?.mode ||
              normalized.status !== prev?.status
            ) {
              return normalized;
            }
            return prev;
          });
        } catch (e) {
          console.error("MQTT Parse Error:", e);
        }
      }
    });

    mqttClientRef.current = client;

    return () => {
      clearInterval(heartbeatCheck);
      client?.end(true);
    };
  }, []);

  const sendCommand = (payload: CommandPayload) => {
    if (mqttClientRef.current) {
      // Pastikan fungsi publish sesuai dengan library MQTT (misal mqtt.js)
      mqttClientRef.current.publish("jemuran/kontrol", payload);
      console.log(`Perintah dikirim: ${payload}`);
    } else {
      console.error("MQTT belum terhubung, tidak bisa mengirim perintah");
    }
  };

  return { isOnline, latestData, rawHistory, lastActionData, sendCommand };
}