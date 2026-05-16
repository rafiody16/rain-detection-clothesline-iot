"use client";

import { useDevice } from "@/contexts/device-context";
import { EmptyDeviceState } from "@/components/custom/empty-device-state";
import { LoaderRing } from "@/components/ui/loader";

export function DeviceGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, hasDevices } = useDevice();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[60vh]">
        <LoaderRing text="Loading devices..." />
      </div>
    );
  }

  if (!hasDevices) {
    return <EmptyDeviceState />;
  }

  return <>{children}</>;
}