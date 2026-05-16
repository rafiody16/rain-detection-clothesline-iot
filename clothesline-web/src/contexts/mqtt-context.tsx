"use client";
import { createContext, useContext } from "react";
import { useMqttStatus } from "@/hooks/use-mqtt-status";
import { useDevice } from "@/contexts/device-context";
import { CommandPayload } from "@/utils/iot-data";

interface MqttContextType {
  isOnline: boolean;
  latestData: any;
  rawHistory: any[];
  lastActionData: any;
  sendCommand: (payload: CommandPayload) => void;
  pingDevice: (deviceId: string) => Promise<boolean>;
}

const MqttContext = createContext<MqttContextType>({ 
  isOnline: false, 
  latestData: null,
  rawHistory: [],
  lastActionData: null,
  sendCommand: () => {},
  pingDevice: async () => false,
});

export function MqttProvider({ children }: { children: React.ReactNode }) {
  const { activeDevice } = useDevice();
  const deviceId = activeDevice?.deviceId || null;
  const mqtt = useMqttStatus(deviceId);
  return (
    <MqttContext.Provider value={mqtt}>
      {children}
    </MqttContext.Provider>
  );
}

export const useMqtt = () => useContext(MqttContext);