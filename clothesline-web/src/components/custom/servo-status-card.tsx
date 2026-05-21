import { Sun, CloudRainWindIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { IoTData } from "@/utils/iot-data"; // Pastikan path import ini sesuai dengan file iot-data.ts milikmu

export interface StatusCardProps {
  lastActionData: IoTData | null;
  formatSmartTime: (timestampValue?: number) => string;
}

export function StatusCard({ lastActionData, formatSmartTime }: StatusCardProps) {
  const isInside = lastActionData?.status; // true = MASUK, false = KELUAR
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Clothesline Status</CardTitle>
        <CardDescription>Servo position</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center pb-8">
        <div className="relative flex items-center justify-center mt-4">

          <div className="relative flex items-center justify-center p-8 ">
            {/* Ambient Glow Background */}
            <div
              className={`absolute w-52 h-52 rounded-full opacity-20 blur-3xl transition-all duration-700 ease-in-out ${isInside
                  ? "bg-blue-500 dark:bg-blue-600"
                  : "bg-amber-400 dark:bg-amber-500 animate-pulse"
                }`}
            />

            {/* Main Circle Indicator */}
            <div
              className={`w-44 h-44 rounded-full flex flex-col items-center justify-center border-8 z-10 transition-all duration-500 ease-in-out bg-zinc-100 dark:bg-zinc-900 ${isInside
                  ? "border-blue-100 dark:border-blue-950/50 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                  : "border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)] animate-[bounce_4s_infinite_ease-in-out]"
                }`}
            >
              {/* Icon Selector Dinamis */}
              <div className="transition-all duration-500 transform hover:scale-110">
                {isInside ? (
                  <CloudRainWindIcon className="w-14 h-14 text-blue-500 dark:text-blue-400 transition-all duration-500" />
                ) : (
                  <Sun className="w-14 h-14 text-amber-400 animate-[spin_20s_linear_infinite] transition-all duration-500" />
                )}
              </div>

              {/* Status Text Utama */}
              <span className={`text-2xl font-extrabold tracking-tight mt-2 transition-colors duration-500 ${isInside ? "text-blue-600 dark:text-blue-400" : "text-amber-500"
                }`}>
                {isInside ? "MASUK" : "KELUAR"}
              </span>

              {/* Sub-text Keterangan */}
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-0.5 select-none">
                {isInside ? "Terlindungi" : "Menjemur"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mt-6 md:mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-800">
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