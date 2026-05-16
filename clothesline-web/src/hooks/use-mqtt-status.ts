"use client";

import { connectMQTT } from "@/utils/mqtt";
import { CommandPayload, IoTData, normalizeIoTData } from "@/utils/iot-data";
import { useState, useEffect, useRef } from "react";
import { useFirebase } from "@/contexts/firebase-context";

export function useMqttStatus(deviceId: string | null) {
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

  // Reset state when deviceId changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOnline(false);
    setLatestData(null);
    setRawHistory([]);
    setLastActionData(null);
  }, [deviceId]);

  useEffect(() => {
    // Don't connect if no deviceId
    if (!deviceId) return;

    let lastDataTimestamp = Date.now();

    // Cek setiap 5 detik, jika data terakhir > 10 detik, anggap offline
    const heartbeatCheck = setInterval(() => {
      const now = Date.now();
      if (now - lastDataTimestamp > 10000) {
        setIsOnline(false);
      }
    }, 5000);

    const topicStatus = `jemuran/${deviceId}/status`;
    const topicData = `jemuran/${deviceId}/data`;

    const client = connectMQTT(deviceId, (topic, message) => {
      const msgStr = message.toString();

      // Logika Topik Status
      if (topic === topicStatus) {
        if (msgStr.includes("Online")) {
          setIsOnline(true);
        } else if (msgStr.includes("Offline")) {
          setIsOnline(false);
        }
      }

      // Logika Topik Data
      if (topic === topicData) {
        setIsOnline(true);
        lastDataTimestamp = Date.now();

        try {
          const parsed = JSON.parse(msgStr);
          const normalized = normalize(parsed);

          setLatestData(normalized);
          setRawHistory((prev) =>
            [...prev, normalized].slice(-150)
          );
          setLastActionData((prev: IoTData | null) => {
            if (!prev) return normalized;
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
      mqttClientRef.current = null;
    };
  }, [deviceId]); // Re-connect when deviceId changes

  const sendCommand = (payload: CommandPayload) => {
    if (!deviceId) {
      console.error("No device selected");
      return;
    }
    if (mqttClientRef.current) {
      const topic = `jemuran/${deviceId}/kontrol`;
      mqttClientRef.current.publish(topic, payload);
      console.log(`Command sent to ${topic}: ${payload}`);
    } else {
      console.error("MQTT not connected, cannot send command");
    }
  };

  /**
   * Send a PING to the device's pair topic and listen for PONG response
   */
  const pingDevice = (targetDeviceId: string): Promise<boolean> => {
    return new Promise(async (resolve) => {
      const url = process.env.NEXT_PUBLIC_MQTT_API_URL;
      if (!url) {
        resolve(false);
        return;
      }

      const mqttLib = await import("mqtt");
      const tempClient = mqttLib.default.connect(url);
      const pairTopic = `jemuran/${targetDeviceId}/pair`;
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          tempClient.end(true);
          resolve(false);
        }
      }, 15000); // 15 second timeout

      tempClient.on("connect", () => {
        tempClient.subscribe(pairTopic);
        tempClient.publish(pairTopic, "PING");
      });

      tempClient.on("message", (_topic: string, payload: Buffer) => {
        try {
          const data = JSON.parse(payload.toString());
          if (data.pong === true) {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              tempClient.end(true);
              resolve(true);
            }
          }
        } catch {
          // Not JSON or not a PONG
        }
      });

      tempClient.on("error", () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          tempClient.end(true);
          resolve(false);
        }
      });
    });
  };

  return { isOnline, latestData, rawHistory, lastActionData, sendCommand, pingDevice };
}