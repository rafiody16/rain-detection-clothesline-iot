"use client"

import { useState, useRef, useEffect } from "react"
import { Activity, Settings2, History, Play, Square, Check, Loader2, WifiOff, XCircle, Timer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMqtt } from "@/contexts/mqtt-context"
import { toast } from "sonner"

export function ServoControl() {
  const { lastActionData, sendCommand, isOnline } = useMqtt();
  const [isMoving, setIsMoving] = useState(false);

  // --- STATE TIMER & INPUT ---
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [inputs, setInputs] = useState({ hh: "0", mm: "0", ss: "0" });
  const timeRef = useRef<NodeJS.Timeout | null>(null);

  const activeMode = lastActionData?.mode?.toUpperCase() || "AUTO";
  const currentAction = lastActionData?.status ? "MASUK" : "KELUAR";

  // Cleanup timer saat komponen unmount
  useEffect(() => {
    return () => {
      if (timeRef.current) clearInterval(timeRef.current);
    }
  }, []);

  // Format detik ke HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  }

  const startTimer = () => {
    const totalSeconds = (parseInt(inputs.hh) * 3600) + (parseInt(inputs.mm) * 60) + parseInt(inputs.ss);

    if (totalSeconds <= 0) {
      toast.error("Waktu harus lebih dari 0!");
      return;
    }

    if (activeMode !== "MANUAL") {
      sendCommand("MANUAL");
    }

    if (timeRef.current) clearInterval(timeRef.current);

    let currentSeconds = totalSeconds;
    setTimeLeft(currentSeconds);
    toast.success(`Timer dimulai: ${formatTime(currentSeconds)}`);

    timeRef.current = setInterval(() => {
      currentSeconds -= 1;
      setTimeLeft(currentSeconds);

      if (currentSeconds <= 0) {
        clearInterval(timeRef.current!);
        setTimeLeft(null);
        sendCommand("MASUK");
        toast.success("Waktu habis! Jemuran otomatis ditarik masuk.");
        triggerMovingUI();
      }
    }, 1000);
  }

  const cancelTimer = () => {
    if (timeRef.current) clearInterval(timeRef.current);
    setTimeLeft(null);
    toast.error("Timer dibatalkan.");
  }

  const triggerMovingUI = () => {
    setIsMoving(true);
    setTimeout(() => setIsMoving(false), 3000);
  }

  const handleInputChange = (field: "hh" | "mm" | "ss", value: string) => {
    const num = value.replace(/[^0-9]/g, "");
    setInputs(prev => ({ ...prev, [field]: num || "0" }));
  }

  return (
    <div className="space-y-6">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 animate-in fade-in-50">
          <WifiOff className="w-5 h-5 text-red-500 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-red-700 dark:text-red-400">Perangkat Offline</p>
            <p className="opacity-80">Perintah tidak bisa dikirim. Menampilkan data terakhir.</p>
          </div>
        </div>
      )}

      {/* Timer Countdown Active Banner */}
      {timeLeft !== null && (
        <div className="flex items-center justify-between p-5 bg-accent text-white rounded-2xl shadow-lg animate-in slide-in-from-top-4 border-b-4 border-accent">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-full animate-pulse">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Sisa Waktu Penjemuran</p>
              <p className="text-3xl font-bold font-mono tracking-tighter">
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={cancelTimer} className="hover:bg-white/20 text-white border border-white/30 px-4">
            <XCircle className="w-4 h-4 mr-2" /> Batal
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: Mode & Kontrol Manual */}
        <Card className="rounded-2xl shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Mode Operasi</CardTitle>
            <CardDescription>Pilih cara kerja sistem atau kendali manual.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={activeMode === "AUTO" ? "default" : "outline"}
                onClick={() => sendCommand("AUTO")}
                className="h-16 flex flex-col gap-1 rounded-xl"
              >
                <Activity className="w-4 h-4" />
                <span>Otomatis</span>
              </Button>
              <Button
                variant={activeMode === "MANUAL" ? "default" : "outline"}
                onClick={() => sendCommand("MANUAL")}
                className="h-16 flex flex-col gap-1 rounded-xl"
              >
                <Settings2 className="w-4 h-4" />
                <span>Manual</span>
              </Button>
            </div>

            {activeMode === "MANUAL" && (
              <div className="pt-4 border-t border-dashed space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-medium">Status:</span>
                  {isMoving ? (
                    <span className="text-xs font-bold text-blue-500 animate-pulse uppercase tracking-tighter flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Bergerak...
                    </span>
                  ) : (
                    <span className={`text-xs font-bold uppercase ${currentAction === "MASUK" ? "text-orange-500" : "text-green-500"}`}>
                      {currentAction === "MASUK" ? "Tertutup" : "Terbuka"}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="lg" disabled={isMoving || currentAction === "KELUAR"} onClick={() => { sendCommand("KELUAR"); triggerMovingUI(); }} className="rounded-xl h-12">
                    <Play className="w-4 h-4 mr-2" /> Buka
                  </Button>
                  <Button variant="outline" size="lg" disabled={isMoving || currentAction === "MASUK"} onClick={() => { sendCommand("MASUK"); triggerMovingUI(); }} className="rounded-xl h-12">
                    <Square className="w-4 h-4 mr-2" /> Tutup
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CARD 2: Jadwal / Timer Input */}
        <Card className="rounded-2xl shadow-sm border-zinc-200 dark:border-zinc-800 border-t-4 border-t-indigo-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" />
              <CardTitle className="text-lg">Jadwal Cepat</CardTitle>
            </div>
            <CardDescription>Tentukan durasi jemuran di luar sebelum ditarik otomatis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Jam</label>
                <Input
                  type="number"
                  placeholder="00"
                  value={inputs.hh}
                  onChange={(e) => handleInputChange("hh", e.target.value)}
                  disabled={timeLeft !== null}
                  className="text-center font-mono text-lg rounded-xl h-12"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Menit</label>
                <Input
                  type="number"
                  placeholder="00"
                  value={inputs.mm}
                  onChange={(e) => handleInputChange("mm", e.target.value)}
                  disabled={timeLeft !== null}
                  className="text-center font-mono text-lg rounded-xl h-12"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Detik</label>
                <Input
                  type="number"
                  placeholder="00"
                  value={inputs.ss}
                  onChange={(e) => handleInputChange("ss", e.target.value)}
                  disabled={timeLeft !== null}
                  className="text-center font-mono text-lg rounded-xl h-12"
                />
              </div>
            </div>

            <Button
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary font-bold"
              disabled={timeLeft !== null || !isOnline}
              onClick={startTimer}
            >
              Mulai Hitung Mundur
            </Button>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-[11px] text-zinc-500 italic leading-relaxed border border-zinc-100 dark:border-zinc-800">
              *Setelah waktu habis, sistem akan mengirimkan perintah <strong>MASUK</strong> dan beralih ke mode Manual.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}