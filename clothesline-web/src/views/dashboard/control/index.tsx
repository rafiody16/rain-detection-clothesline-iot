"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Settings, History, Play, Square, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exec } from "child_process"

interface ControlPageProps {
  currentStatus: string;
  onCommand: (command: "MASUK" | "KELUAR" | "AUTO") => void;
}

export default function ControlPage({ currentStatus, onCommand }: ControlPageProps) {
  const [activeMode, setActiveMode] = useState<"otomatis" | "manual" | "jadwal">("otomatis");
  const [lastAction, setLastAction] = useState<"MASUK" | "KELUAR">("MASUK");
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (currentStatus.includes("AUTO") && activeMode !== "otomatis") {
      setActiveMode("otomatis");
    }
  }, [currentStatus]);

  const handleModeSelect = (mode: "otomatis" | "manual" | "jadwal") => {
    if (mode === "manual" && activeMode !== "manual") {
      const confirm = window.confirm("Are you sure you want to switch to manual mode? This will disable automatic sensor control.");
      if (confirm) {
        setActiveMode("manual");
        executeCommand(lastAction);
      }
    } else if (mode === "otomatis") {
      setActiveMode("otomatis");
      onCommand("AUTO");
    } else if (mode === "jadwal") {
      setActiveMode("jadwal");
      alert("Scheduling feature is not implemented yet.");
    }
  }

  const executeCommand = (cmd: "MASUK" | "KELUAR") => {
    setLastAction(cmd);
    onCommand(cmd);

    setIsMoving(true);
    setTimeout(() => {
      setIsMoving(false);
    }, 3000);
  }

  const handleActionClick = (cmd: "MASUK" | "KELUAR") => {
    if (activeMode === "otomatis") {
      const confirm = window.confirm("You are currently in automatic mode. Do you want to switch to manual mode and execute this command?");
      if (confirm) {
        setActiveMode("manual");
        executeCommand(cmd);
      }
    } else {
      executeCommand(cmd);
    }
  }
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-[#0B0E14] text-slate-200 min-h-screen font-sans">
      
      {/* Header Info */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-semibold text-white">Pengaturan Jemuran</h2>
        <p className="text-sm text-slate-400 mt-1">Kelola cara jemuran bekerja berdasarkan kondisi cuaca atau jadwal.</p>
      </div>

      {/* SECTION: Mode Operasi */}
      <div>
        <h3 className="text-md font-medium text-white mb-4">Pilih Mode Operasi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card Otomatis */}
          <div 
            onClick={() => handleModeSelect("otomatis")}
            className={`flex flex-col items-center justify-center p-6 rounded-xl border cursor-pointer transition-all ${
              activeMode === "otomatis" 
                ? "bg-[#1E2336] border-blue-500" 
                : "bg-[#131722] border-slate-800 hover:bg-[#1A1F2E]"
            }`}
          >
            <Activity className={`w-8 h-8 mb-3 ${activeMode === "otomatis" ? "text-blue-400" : "text-slate-400"}`} />
            <span className="font-semibold text-white">Otomatis</span>
            <span className="text-xs text-slate-400 mt-1">Berbasis sensor</span>
          </div>

          {/* Card Manual */}
          <div 
            onClick={() => handleModeSelect("manual")}
            className={`flex flex-col items-center justify-center p-6 rounded-xl border cursor-pointer transition-all ${
              activeMode === "manual" 
                ? "bg-[#1E1915] border-orange-500" 
                : "bg-[#131722] border-slate-800 hover:bg-[#1A1F2E]"
            }`}
          >
            <Settings className={`w-8 h-8 mb-3 ${activeMode === "manual" ? "text-orange-400" : "text-slate-400"}`} />
            <span className="font-semibold text-white">Manual</span>
            <span className="text-xs text-slate-400 mt-1">Kontrol manual</span>
          </div>

          {/* Card Jadwal */}
          <div 
            onClick={() => handleModeSelect("jadwal")}
            className={`flex flex-col items-center justify-center p-6 rounded-xl border cursor-pointer transition-all ${
              activeMode === "jadwal" 
                ? "bg-[#1E2336] border-purple-500" 
                : "bg-[#131722] border-slate-800 hover:bg-[#1A1F2E]"
            }`}
          >
            <History className={`w-8 h-8 mb-3 ${activeMode === "jadwal" ? "text-purple-400" : "text-slate-400"}`} />
            <span className="font-semibold text-white">Jadwal</span>
            <span className="text-xs text-slate-400 mt-1">Berbasis waktu</span>
          </div>

        </div>
      </div>

      {/* SECTION: Kontrol Manual */}
      <div className={`mt-4 transition-opacity ${activeMode !== "manual" ? "opacity-50 grayscale pointer-events-none" : "opacity-100"}`}>
        <h3 className="text-md font-medium text-white mb-4">Kontrol Manual</h3>
        
        {/* Status Bar */}
        <div className="flex items-center gap-2 p-4 bg-[#131722] border border-slate-800 rounded-lg mb-4">
          <span className="text-sm text-slate-300">Status Saat Ini:</span>
          {isMoving ? (
            <span className="text-sm font-semibold flex items-center text-blue-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Menggerakkan Jemuran...
            </span>
          ) : (
            <span className={`text-sm font-semibold flex items-center gap-1 ${
              lastAction === "MASUK" ? "text-red-500" : "text-green-500"
            }`}>
              <Check className="w-4 h-4" /> 
              {lastAction === "MASUK" ? "Tertutup (Terlindung)" : "Terbuka (Menjemur)"}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Tombol Buka (KELUAR) */}
          <button 
            disabled={isMoving || lastAction === "KELUAR"}
            onClick={() => handleActionClick("KELUAR")}
            className={`flex flex-col items-center justify-center p-5 rounded-lg border transition-all ${
              lastAction === "KELUAR"
                ? "bg-[#9B7BFF] border-[#9B7BFF] text-black" 
                : "bg-[#131722] border-slate-800 text-slate-300 hover:bg-[#1A1F2E]"
            }`}
          >
            <Play className="w-5 h-5 mb-2" fill={lastAction === "KELUAR" ? "currentColor" : "none"} />
            <span className="font-semibold text-sm">Buka Jemuran</span>
            <span className={`text-xs mt-1 ${lastAction === "KELUAR" ? "text-black/70" : "text-slate-500"}`}>Gerak Keluar</span>
          </button>

          {/* Tombol Tutup (MASUK) */}
          <button 
            disabled={isMoving || lastAction === "MASUK"}
            onClick={() => handleActionClick("MASUK")}
            className={`flex flex-col items-center justify-center p-5 rounded-lg border transition-all ${
              lastAction === "MASUK"
                ? "bg-[#9B7BFF] border-[#9B7BFF] text-black" 
                : "bg-[#131722] border-slate-800 text-slate-300 hover:bg-[#1A1F2E]"
            }`}
          >
            <Square className="w-5 h-5 mb-2" fill={lastAction === "MASUK" ? "currentColor" : "none"} />
            <span className="font-semibold text-sm">Tutup Jemuran</span>
            <span className={`text-xs mt-1 ${lastAction === "MASUK" ? "text-black/70" : "text-slate-500"}`}>Gerak Masuk</span>
          </button>

        </div>
      </div>

    </div>
  )
}