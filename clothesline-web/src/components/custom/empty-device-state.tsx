"use client";

import { Button } from "@/components/ui/button";
import { useDevice } from "@/contexts/device-context";
import { Cpu, Plus, Wifi, Zap, ArrowRight } from "lucide-react";

export function EmptyDeviceState() {
  const { setShowAddWizard } = useDevice();

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 min-h-[60vh]">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="relative mx-auto w-28 h-28">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse" />
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-2 border-dashed border-blue-300 dark:border-blue-700 flex items-center justify-center">
            <Cpu className="w-12 h-12 text-blue-500/70" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight">
            No Devices Connected
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            Add your first Smart Clothesline device to start monitoring weather
            conditions and controlling your clothesline remotely.
          </p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => setShowAddWizard(true)}
          size="lg"
          className="h-12 px-8 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Your First Device
        </Button>

        {/* Feature hints */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
            <Wifi className="w-5 h-5 text-blue-500" />
            <p className="text-xs text-muted-foreground text-center">
              Easy WiFi Setup
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
            <Zap className="w-5 h-5 text-amber-500" />
            <p className="text-xs text-muted-foreground text-center">
              Real-time Data
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
            <ArrowRight className="w-5 h-5 text-green-500" />
            <p className="text-xs text-muted-foreground text-center">
              Auto Control
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
