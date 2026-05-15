import { Sun } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { IoTData } from "@/utils/iot-data"; // Pastikan path import ini sesuai dengan file iot-data.ts milikmu

export interface StatusCardProps {
  lastActionData: IoTData | null;
  formatSmartTime: (timestampValue?: number) => string; 
}

export function StatusCard({ lastActionData, formatSmartTime }: StatusCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm h-full">
      <CardHeader>
        <CardTitle>Clothesline Status</CardTitle>
        <CardDescription>Servo position</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-between pb-8">
        <div className="relative flex items-center justify-center mt-4">

          {/* Background Circle Decorative */}
          <div
            className={`absolute w-48 h-48 rounded-full opacity-10 blur-2xl transition-colors duration-500 ${
              lastActionData?.status ? "bg-zinc-500" : "bg-amber-500"
            }`}
          />

          {/* Main Circle Indicator */}
          <div
            className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border-8 z-10 transition-all duration-500 ${
              lastActionData?.status
                ? "border-zinc-200 dark:border-zinc-800"
                : "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
            }`}
          >
            <Sun
              className={`w-12 h-12 transition-colors duration-500 ${
                lastActionData?.status ? "text-zinc-500" : "text-amber-400"
              } mb-1`}
            />

            <span className="font-black text-xl tracking-tight">
              {lastActionData?.status ? "MASUK" : "KELUAR"}
            </span>

            <span className="text-[10px] uppercase font-bold text-muted-foreground">
              {lastActionData?.status ? "Terlindungi" : "Menjemur"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="text-center">
            <p className="text-[10px] font-bold text-zinc-400 uppercase">
              System Mode
            </p>

            <p className="font-bold capitalize text-sm">
              {lastActionData?.mode || "--"}
            </p>
          </div>

          <div className="text-center border-l border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-bold text-zinc-400 uppercase">
              Last Action Time
            </p>

            <p className="font-bold text-sm">
              {formatSmartTime(lastActionData?.timestampValue)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}