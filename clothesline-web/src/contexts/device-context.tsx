"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import type { UserDevice } from "@/utils/db/device-service";

interface DeviceContextType {
  devices: UserDevice[];
  activeDevice: UserDevice | null;
  setActiveDevice: (device: UserDevice) => void;
  addDevice: (deviceId: string, name: string) => Promise<boolean>;
  removeDevice: (deviceId: string) => Promise<boolean>;
  renameDevice: (deviceId: string, name: string) => Promise<boolean>;
  refetchDevices: () => Promise<void>;
  isLoading: boolean;
  hasDevices: boolean;
  showAddWizard: boolean;
  setShowAddWizard: (show: boolean) => void;
}

const DeviceContext = createContext<DeviceContextType>({
  devices: [],
  activeDevice: null,
  setActiveDevice: () => {},
  addDevice: async () => false,
  removeDevice: async () => false,
  renameDevice: async () => false,
  refetchDevices: async () => {},
  isLoading: true,
  hasDevices: false,
  showAddWizard: false,
  setShowAddWizard: () => {},
});

const ACTIVE_DEVICE_KEY = "smartline_active_device";

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [activeDevice, setActiveDeviceState] = useState<UserDevice | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showAddWizard, setShowAddWizard] = useState(false);

  // Fetch devices from API
  const fetchDevices = useCallback(async () => {
    if (status === "loading") return;
    if (!session?.user?.email) {
      setDevices([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/devices");
      if (res.ok) {
        const data = await res.json();
        setDevices(data);

        // Restore previously active device from localStorage
        const savedId =
          typeof window !== "undefined"
            ? localStorage.getItem(ACTIVE_DEVICE_KEY)
            : null;
        const savedDevice = data.find(
          (d: UserDevice) => d.deviceId === savedId
        );

        if (savedDevice) {
          setActiveDeviceState(savedDevice);
        } else if (data.length > 0) {
          setActiveDeviceState(data[0]);
        } else {
          setActiveDeviceState(null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch devices:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDevices();
  }, [fetchDevices]);

  // Set active device and persist to localStorage
  const setActiveDevice = useCallback((device: UserDevice) => {
    setActiveDeviceState(device);
    if (typeof window !== "undefined") {
      localStorage.setItem(ACTIVE_DEVICE_KEY, device.deviceId);
    }
  }, []);

  // Add device
  const addDevice = useCallback(
    async (deviceId: string, name: string): Promise<boolean> => {
      try {
        const res = await fetch("/api/devices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId, name }),
        });
        const result = await res.json();
        if (result.success) {
          await fetchDevices();
          // Set the newly added device as active
          const newDevice: UserDevice = {
            deviceId: deviceId.toUpperCase(),
            name,
            addedAt: new Date().toISOString(),
          };
          setActiveDevice(newDevice);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [fetchDevices, setActiveDevice]
  );

  // Remove device
  const removeDevice = useCallback(
    async (deviceId: string): Promise<boolean> => {
      try {
        const res = await fetch("/api/devices", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId }),
        });
        const result = await res.json();
        if (result.success) {
          await fetchDevices();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [fetchDevices]
  );

  // Rename device
  const renameDevice = useCallback(
    async (deviceId: string, name: string): Promise<boolean> => {
      try {
        const res = await fetch("/api/devices", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId, name }),
        });
        const result = await res.json();
        if (result.success) {
          await fetchDevices();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [fetchDevices]
  );

  return (
    <DeviceContext.Provider
      value={{
        devices,
        activeDevice,
        setActiveDevice,
        addDevice,
        removeDevice,
        renameDevice,
        refetchDevices: fetchDevices,
        isLoading,
        hasDevices: devices.length > 0,
        showAddWizard,
        setShowAddWizard,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export const useDevice = () => useContext(DeviceContext);
