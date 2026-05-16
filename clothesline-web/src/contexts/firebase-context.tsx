"use client";
import { createContext, useContext } from "react";
import { useFirebaseStatus } from "@/hooks/use-firebase-status";
import { useDevice } from "@/contexts/device-context";
import { IoTData } from "@/utils/iot-data";

interface FirebaseContextType {
    historyData: IoTData[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

const FirebaseContext = createContext<FirebaseContextType>({
    historyData: [],
    isLoading: true,
    error: null,
    refetch: () => { },
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
    const { activeDevice } = useDevice();
    const deviceId = activeDevice?.deviceId || null;
    const firebase = useFirebaseStatus(deviceId);
    return (
        <FirebaseContext.Provider value={firebase}>
            {children}
        </FirebaseContext.Provider>
    );
}

export const useFirebase = () => useContext(FirebaseContext);