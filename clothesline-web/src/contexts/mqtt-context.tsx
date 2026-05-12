"use client";
import { createContext, useContext } from "react";
import { useMqttStatus } from "@/hooks/use-mqtt-status";

interface MqttContextType {
  isOnline: boolean;
  latestData: any;
  rawHistory: any[];
  jemuranStatus: string;
  lastActionTime: number | null;
}

const MqttContext = createContext<MqttContextType>({ 
  isOnline: false, 
  latestData: null,
  rawHistory: [],
  jemuranStatus: "",
  lastActionTime: null,
});

export function MqttProvider({ children }: { children: React.ReactNode }) {
  const mqtt = useMqttStatus();
  return (
    <MqttContext.Provider value={mqtt}>
      {children}
    </MqttContext.Provider>
  );
}

export const useMqtt = () => useContext(MqttContext);