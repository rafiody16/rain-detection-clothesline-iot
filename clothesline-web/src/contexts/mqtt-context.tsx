"use client";
import { createContext, useContext } from "react";
import { useMqttStatus } from "@/hooks/use-mqtt-status";
import { CommandPayload } from "@/utils/iot-data";

interface MqttContextType {
  isOnline: boolean;
  latestData: any;
  rawHistory: any[];
  lastActionData: any;
  sendCommand: (payload: CommandPayload) => void;
}

const MqttContext = createContext<MqttContextType>({ 
  isOnline: false, 
  latestData: null,
  rawHistory: [],
  lastActionData: null,
  sendCommand: () => {},
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