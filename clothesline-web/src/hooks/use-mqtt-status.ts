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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsOnline(false);
      setLatestData(null);
      setRawHistory([]);
      setLastActionData(null);
    }, 0);

    if (!deviceId) return () => clearTimeout(timeoutId);

    let lastDataTimestamp = Date.now();

    const heartbeatCheck = setInterval(() => {
      if (Date.now() - lastDataTimestamp > 10000) {
        setIsOnline(false);
      }
    }, 5000);

    const topicStatus = `jemuran/${deviceId}/status`;
    const topicData = `jemuran/${deviceId}/data`;

    const client = connectMQTT(deviceId, (topic, message) => {
      const msgStr = message.toString();

      // Logika Topik Status
      if (topic === topicStatus) {
        setIsOnline(msgStr.includes("Online"));
      }

      // Logika Topik Data
      if (topic === topicData) {
        setIsOnline(true);
        lastDataTimestamp = Date.now();

        try {
          const parsed = JSON.parse(msgStr);
          const normalized = normalizeIoTData(parsed);

          setLatestData(normalized);
          setRawHistory((prev) => [...prev, normalized].slice(-150));
          setLastActionData((prev) => {
            if (!prev || normalized.mode !== prev.mode || normalized.status !== prev.status) {
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
      clearTimeout(timeoutId);
      clearInterval(heartbeatCheck);
      client?.end(true);
      mqttClientRef.current = null;
    };
  }, [deviceId]);

  const sendCommand = (payload: CommandPayload) => {
    if (!deviceId || !mqttClientRef.current) {
      console.error("MQTT not connected or no device selected");
      return;
    }
    const topic = `jemuran/${deviceId}/kontrol`;
    mqttClientRef.current.publish(topic, payload);
    console.log(`Command sent to ${topic}: ${payload}`);
  };

  const pingDevice = (targetDeviceId: string): Promise<boolean> => {
    return new Promise(async (resolve) => {
      const url = process.env.NEXT_PUBLIC_MQTT_API_URL;
      if (!url) return resolve(false);

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
      }, 15000);

      tempClient.on("connect", () => {
        tempClient.subscribe(pairTopic);
        tempClient.publish(pairTopic, "PING");
      });

      tempClient.on("message", (_topic, payload) => {
        try {
          const data = JSON.parse(payload.toString());
          if (data.pong === true && !resolved) {
            resolved = true;
            clearTimeout(timeout);
            tempClient.end(true);
            resolve(true);
          }
        } catch {}
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