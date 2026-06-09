"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDevice } from "@/contexts/device-context";
import {
  Wifi,
  WifiOff,
  Power,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Cpu,
  Zap,
  Smartphone,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

type WizardStep = "enter-id" | "check-device" | "wifi-guide" | "name-device" | "complete";

export function AddDeviceWizard() {
  const { showAddWizard, setShowAddWizard, addDevice } = useDevice();
  const [step, setStep] = useState<WizardStep>("enter-id");
  const [deviceId, setDeviceId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (showAddWizard) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep("enter-id");
      setDeviceId("");
      setDeviceName("");
      setIsChecking(false);
      setDeviceOnline(false);
      setPollingCount(0);
      setIsSubmitting(false);
    }
  }, [showAddWizard]);

  // Ping device via MQTT
  const checkDeviceOnline = useCallback(async (targetId: string) => {
    try {
      const mqttLib = await import("mqtt");
      const url = process.env.NEXT_PUBLIC_MQTT_API_URL;
      if (!url) return false;

      return new Promise<boolean>((resolve) => {
        const client = mqttLib.default.connect(url);
        const pairTopic = `jemuran/${targetId}/pair`;
        let resolved = false;

        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            client.end(true);
            resolve(false);
          }
        }, 10000);

        client.on("connect", () => {
          client.subscribe(pairTopic);
          client.publish(pairTopic, "PING");
        });
        
        client.on("message", (_topic: string, payload: Buffer) => {
          try {
            const data = JSON.parse(payload.toString());
            
            // PERBAIKAN: Gunakan .toUpperCase() pada keduanya agar perbandingan aman
            const receivedId = (data.deviceId || "").toUpperCase();
            const targetIdUpper = targetId.toUpperCase();

            if (data.pong === true && receivedId === targetIdUpper) {
              if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                client.end(true);
                resolve(true);
              }
            }
          } catch {
            // Not valid JSON
          }
        });

        client.on("error", () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            client.end(true);
            resolve(false);
          }
        });
      });
    } catch {
      return false;
    }
  }, []);

  // Validate and proceed from step 1
  const handleCheckDevice = async () => {
    const cleanId = deviceId.trim().toUpperCase();
    if (!/^[A-Fa-f0-9]{12}$/.test(cleanId)) {
      toast.error("Invalid Device ID. Must be 12 hexadecimal characters (e.g., A1B2C3D4E5F6).");
      return;
    }
    setDeviceId(cleanId);
    setStep("check-device");
    setIsChecking(true);
    setPollingCount(0);

    const online = await checkDeviceOnline(cleanId);
    setIsChecking(false);

    if (online) {
      setDeviceOnline(true);
      // Device already online - skip WiFi setup, go straight to naming
      setTimeout(() => setStep("name-device"), 1500);
    } else {
      setDeviceOnline(false);
      // Device not found - show WiFi setup guide
      setStep("wifi-guide");
    }
  };

  // Retry checking from WiFi guide
  const handleRetryCheck = async () => {
    setIsChecking(true);
    setPollingCount((prev) => prev + 1);
    const online = await checkDeviceOnline(deviceId);
    setIsChecking(false);

    if (online) {
      setDeviceOnline(true);
      toast.success("Device detected! Proceeding...");
      setTimeout(() => setStep("name-device"), 1000);
    } else {
      toast.error("Device not detected. Please check the WiFi setup and try again.");
    }
  };

  // Final step: save device
  const handleComplete = async () => {
    if (!deviceName.trim()) {
      toast.error("Please enter a name for your device.");
      return;
    }
    setIsSubmitting(true);
    const success = await addDevice(deviceId, deviceName.trim());
    setIsSubmitting(false);

    if (success) {
      setStep("complete");
      toast.success("Device added successfully!");
    } else {
      toast.error("Failed to add device. It may already be registered.");
    }
  };

  const stepNumber = {
    "enter-id": 1,
    "check-device": 2,
    "wifi-guide": 2,
    "name-device": 3,
    complete: 4,
  };

  return (
    <Dialog open={showAddWizard} onOpenChange={setShowAddWizard}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-500" />
            Add New Device
          </DialogTitle>
          <DialogDescription>
            Connect a Smart Clothesline device to your account.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-1">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  stepNumber[step] >= s
                    ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                }`}
              >
                {stepNumber[step] > s ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  s
                )}
              </div>
              {s < 4 && (
                <div
                  className={`flex-1 h-0.5 mx-1 transition-all duration-300 ${
                    stepNumber[step] > s
                      ? "bg-blue-500"
                      : "bg-zinc-200 dark:bg-zinc-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="min-h-[280px] flex flex-col">
          {/* STEP 1: Enter Device ID */}
          {step === "enter-id" && (
            <div className="flex-1 flex flex-col gap-5 animate-in fade-in-50 slide-in-from-right-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <AlertCircle className="w-4 h-4" />
                  Where to find your Device ID?
                </h4>
                <p className="text-xs text-blue-600/80 dark:text-blue-400/70 mt-1.5 leading-relaxed">
                  The Device ID is displayed on your ESP32&apos;s serial monitor when it boots up.
                  It&apos;s a 12-character code based on the device&apos;s MAC address (e.g., <code className="bg-blue-100 dark:bg-blue-800/50 px-1 py-0.5 rounded text-[11px]">A1B2C3D4E5F6</code>).
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="device-id" className="text-sm font-medium">
                  Device ID
                </Label>
                <Input
                  id="device-id"
                  placeholder="e.g., A1B2C3D4E5F6"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value.toUpperCase())}
                  maxLength={12}
                  className="font-mono text-lg tracking-widest text-center h-12 uppercase"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  {deviceId.length}/12 characters
                </p>
              </div>

              <div className="mt-auto">
                <Button
                  onClick={handleCheckDevice}
                  disabled={deviceId.trim().length !== 12}
                  className="w-full h-11"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Checking Device */}
          {step === "check-device" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-in fade-in-50">
              {isChecking ? (
                <>
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-semibold">Searching for device...</p>
                    <p className="text-sm text-muted-foreground">
                      Looking for device <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs">{deviceId}</code>
                    </p>
                  </div>
                </>
              ) : deviceOnline ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      Device Found!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your device is online. Proceeding to setup...
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* STEP 2b: WiFi Setup Guide */}
          {step === "wifi-guide" && (
            <div className="flex-1 flex flex-col gap-4 animate-in fade-in-50 slide-in-from-right-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <WifiOff className="w-4 h-4 shrink-0" />
                  Device not detected. It needs WiFi setup first.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Follow these steps:</h4>

                <div className="space-y-2.5">
                  <div className="flex gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border">
                    <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Power className="w-3.5 h-3.5" /> Power on the device
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Connect your ESP32 to a power source.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border">
                    <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5" /> Connect to device WiFi
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        On your phone/laptop, connect to WiFi network:
                      </p>
                      <code className="block mt-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/40 rounded text-xs font-mono text-blue-700 dark:text-blue-300">
                        Clothesline_{deviceId.substring(6)}
                      </code>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border">
                    <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" /> Configure WiFi
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Open <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-[11px]">192.168.4.1</code> in your browser and enter your home WiFi credentials.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border">
                    <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">4</div>
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5" /> Wait & retry
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        After the device connects to WiFi, click the button below to detect it.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {pollingCount > 2 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    <strong>Still not connecting?</strong> The WiFi credentials may be incorrect.
                    The device should have automatically restarted in AP mode — try connecting to 
                    <code className="mx-1">Clothesline_{deviceId.substring(6)}</code> again and re-enter the correct WiFi password.
                  </p>
                </div>
              )}

              <div className="mt-auto flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("enter-id")}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleRetryCheck}
                  disabled={isChecking}
                  className="flex-1"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" /> Detect Device
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Name Device */}
          {step === "name-device" && (
            <div className="flex-1 flex flex-col gap-5 animate-in fade-in-50 slide-in-from-right-4">
              <div className="text-center space-y-1">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-semibold">Device is online!</p>
                <p className="text-sm text-muted-foreground">
                  Give your device a friendly name.
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="device-name" className="text-sm font-medium">
                  Device Name
                </Label>
                <Input
                  id="device-name"
                  placeholder='e.g., "Backyard Clothesline"'
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="h-12"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  ID: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">{deviceId}</code>
                </p>
              </div>

              <div className="mt-auto flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("enter-id")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={!deviceName.trim() || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...
                    </>
                  ) : (
                    <>
                      Add Device
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Complete */}
          {step === "complete" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-in fade-in-50 zoom-in-95">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">All Set!</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>{deviceName}</strong> has been added to your account.
                </p>
              </div>
              <Button
                onClick={() => setShowAddWizard(false)}
                className="w-full h-11"
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
