"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDevice } from "@/contexts/device-context";
import { connectMQTT } from "@/utils/mqtt";
import { Settings } from "lucide-react"
import { useEffect, useState } from "react";

interface SystemLog {
  id: string;
  timestamp: string;
  level: "INFO" | "DEBUG" | "EVENT" | "ERROR";
  message: string;
}

export default function SystemLogsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [weatherData, setWeatherData] = useState<any>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const { activeDevice } = useDevice();
  const deviceId = activeDevice?.deviceId || null;

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

  const getLogColor = (level: string) => {
    switch (level) {
      case "ERROR": return "text-red-400";
      case "EVENT": return "text-blue-400";
      case "DEBUG": return "text-zinc-400";
      case "INFO": return "text-green-400";
      default: return "text-green-400";
    }
  }
  return (
<>
        <div className="flex flex-1 flex-col gap-6 p-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-lg">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
              <p className="text-muted-foreground">Hardware connectivity and error tracking.</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ESP32 Diagnostic Logs</CardTitle>
              <CardDescription>Event traces for servo actions and sensor failures.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black/90 text-green-400 p-4 rounded-lg font-mono text-sm h-fit max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 dark:scrollbar-thumb-zinc-600">
                {logs.length === 0 ? (
                  <div className="text-zinc-600 italic">Waiting for incoming logs...</div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="mb-1 flex gap-2 hover:bg-zinc-800/50 transition-colors">
                      <span className="text-zinc-500 shrink-0">[{log.timestamp}]</span>
                      <span className={`font-bold shrink-0 ${getLogColor(log.level)}`}>
                        {log.level}:
                      </span>
                      <span className="text-zinc-300 break-all">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        </>
  )
}
