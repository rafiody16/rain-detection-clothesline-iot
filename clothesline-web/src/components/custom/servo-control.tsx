"use client"

import { useState } from "react"
import { Activity, Settings2, History, Play, Square, Check, Loader2, WifiOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useMqtt } from "@/contexts/mqtt-context"
import { toast } from "sonner"

export function ServoControl() {
  const { lastActionData, sendCommand, isOnline } = useMqtt();
  const [isMoving, setIsMoving] = useState(false);

  const activeMode = lastActionData?.mode?.toUpperCase() || "AUTO";
  const currentAction = lastActionData?.status ? "MASUK" : "KELUAR";

  const handleModeSelect = (mode: "AUTO" | "MANUAL" | "TIMER") => {
    if (!isOnline) {
      toast.error("Perangkat sedang offline. Tidak bisa mengirim perintah.");
      return;
    }

    if (mode === activeMode) return;

    if (mode === "MANUAL" && activeMode !== "MANUAL") {
      const confirm = window.confirm("Beralih ke mode manual? Sensor cuaca akan dimatikan.");
      if (confirm) sendCommand("MANUAL");
    }
    else if (mode === "AUTO") {
      sendCommand("AUTO");
    }
    else if (mode === "TIMER") {
      alert("Fitur jadwal belum diimplementasikan.");
      // sendCommand("TIMER"); // Buka komentar ini jika alatnya sudah siap
    }
  }

  const handleActionClick = (cmd: "MASUK" | "KELUAR") => {
    if (!isOnline) {
      toast.error("Perangkat sedang offline. Tidak bisa mengirim perintah.");
      return;
    }
    sendCommand(cmd);
    toast.success(`Perintah "${cmd}" berhasil dikirim!`);
    triggerMovingUI();

  }

  const triggerMovingUI = () => {
    setIsMoving(true);
    setTimeout(() => setIsMoving(false), 3000);
  }

  return (
    <div className="space-y-6">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 animate-in fade-in-50">
          <WifiOff className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Perangkat Offline</p>
            <p className="text-xs text-red-600/80 dark:text-red-400/70">
              Perintah tidak bisa dikirim. Data yang ditampilkan adalah data terakhir yang tersimpan.
            </p>
          </div>
        </div>
      )}

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Pengaturan Jemuran</CardTitle>
          <CardDescription>
            Kelola cara jemuran bekerja berdasarkan kondisi cuaca atau jadwal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">

          {/* SECTION: Mode Operasi */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pilih Mode Operasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Card Otomatis */}
              <div
                onClick={() => handleModeSelect("AUTO")}
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all duration-500 ${!isOnline ? "opacity-50 cursor-not-allowed" : ""
                  } ${activeMode === "AUTO"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-blue-300"
                  }`}
              >
                <Activity className={`w-8 h-8 transition-colors duration-500 ${activeMode === "AUTO" ? "text-blue-500" : "text-zinc-400"}`} />
                <div className="text-center">
                  <div className="font-semibold">Otomatis</div>
                  <div className="text-xs text-muted-foreground mt-1">Berbasis sensor</div>
                </div>
              </div>

              {/* Card Manual */}
              <div
                onClick={() => handleModeSelect("MANUAL")}
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all duration-500 ${!isOnline ? "opacity-50 cursor-not-allowed" : ""
                  } ${activeMode === "MANUAL"
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-amber-300"
                  }`}
              >
                <Settings2 className={`w-8 h-8 transition-colors duration-500 ${activeMode === "MANUAL" ? "text-amber-500" : "text-zinc-400"}`} />
                <div className="text-center">
                  <div className="font-semibold">Manual</div>
                  <div className="text-xs text-muted-foreground mt-1">Kontrol manual</div>
                </div>
              </div>

              {/* Card Jadwal */}
              <div
                onClick={() => handleModeSelect("TIMER")}
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all duration-500 ${!isOnline ? "opacity-50 cursor-not-allowed" : ""
                  } ${activeMode === "TIMER"
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-purple-300"
                  }`}
              >
                <History className={`w-8 h-8 transition-colors duration-500 ${activeMode === "TIMER" ? "text-purple-500" : "text-zinc-400"}`} />
                <div className="text-center">
                  <div className="font-semibold">Jadwal</div>
                  <div className="text-xs text-muted-foreground mt-1">Berbasis waktu</div>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION: Kontrol Manual — hanya tampil saat mode MANUAL */}
          {activeMode === "MANUAL" && (
            <div className="space-y-4 animate-in slide-in-from-top-4">
              <h3 className="text-lg font-medium">Kontrol Manual</h3>

              {/* Status Bar */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium">
                  Status Saat Ini:
                  {isMoving ? (
                    <span className="ml-2 text-blue-600 dark:text-blue-400 inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Menggerakkan Jemuran...
                    </span>
                  ) : (
                    <span className={`ml-2 font-bold ${currentAction === "MASUK" ? "text-orange-600" : "text-green-600"}`}>
                      <Check className="w-4 h-4 inline mr-1" />
                      {currentAction === "MASUK" ? "Tertutup (Terlindung)" : "Terbuka (Menjemur)"}
                      {!isOnline && <span className="text-xs font-normal text-muted-foreground ml-1">(data terakhir)</span>}
                    </span>
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">

                {/* Tombol Buka (KELUAR) */}
                <Button
                  variant={currentAction === "KELUAR" ? "default" : "outline"}
                  disabled={!isOnline || isMoving || currentAction === "KELUAR"}
                  onClick={() => handleActionClick("KELUAR")}
                  className="flex h-auto flex-col items-center justify-center gap-2 rounded-xl p-4 transition-all duration-300"
                >
                  <Play className={`w-5 h-5 ${currentAction === "KELUAR" ? "fill-current" : ""}`} />
                  <div className="space-y-0 text-center">
                    <span className="block font-bold text-sm">Buka Jemuran</span>
                    <span className="block text-[10px] font-normal opacity-80">Gerak Keluar</span>
                  </div>
                </Button>

                {/* Tombol Tutup (MASUK) */}
                <Button
                  variant={currentAction === "MASUK" ? "default" : "outline"}
                  disabled={!isOnline || isMoving || currentAction === "MASUK"}
                  onClick={() => handleActionClick("MASUK")}
                  className="flex h-auto flex-col items-center justify-center gap-2 rounded-xl p-4 transition-all duration-300"
                >
                  <Square className={`w-5 h-5 ${currentAction === "MASUK" ? "fill-current" : ""}`} />
                  <div className="space-y-0 text-center">
                    <span className="block font-bold text-sm">Tutup Jemuran</span>
                    <span className="block text-[10px] font-normal opacity-80">Gerak Masuk</span>
                  </div>
                </Button>

              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
