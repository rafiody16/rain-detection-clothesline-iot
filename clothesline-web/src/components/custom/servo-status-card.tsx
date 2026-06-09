import {
  Sun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Moon,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";


import { IoTData } from "@/utils/iot-data";

export interface StatusCardProps {
  lastActionData: IoTData | null;
  kondisiCuaca?: string;
  formatSmartTime: (timestampValue?: number) => string;
}

export function StatusCard({
  lastActionData,
  kondisiCuaca,
  formatSmartTime,
}: StatusCardProps) {
  const isInside = lastActionData?.status;

  const getWeatherUI = () => {
    switch (kondisiCuaca) {
      case "Cerah Terik":
        return {
          Icon: Sun,
          iconColor: "text-yellow-400",
          borderColor: "border-yellow-400",
          glowColor: "bg-yellow-400",
          statusText: "Aman Menjemur",
          animation: "animate-[spin_20s_linear_infinite]",
        };

      case "Berawan":
        return {
          Icon: Cloud,
          iconColor: "text-slate-400",
          borderColor: "border-slate-400",
          glowColor: "bg-slate-400",
          statusText: "Berawan",
          animation: "",
        };

      case "Mendung":
        return {
          Icon: CloudFog,
          iconColor: "text-amber-500",
          borderColor: "border-amber-500",
          glowColor: "bg-amber-500",
          statusText: "Antisipasi Hujan",
          animation: "",
        };

      case "Gerimis":
        return {
          Icon: CloudDrizzle,
          iconColor: "text-sky-500",
          borderColor: "border-sky-500",
          glowColor: "bg-sky-500",
          statusText: "Gerimis",
          animation: "",
        };

      case "Hujan Deras":
        return {
          Icon: CloudRain,
          iconColor: "text-blue-500",
          borderColor: "border-blue-500",
          glowColor: "bg-blue-500",
          statusText: "Hujan Deras",
          animation: "animate-pulse",
        };

      case "Malam/Gelap":
        return {
          Icon: Moon,
          iconColor: "text-indigo-400",
          borderColor: "border-indigo-400",
          glowColor: "bg-indigo-400",
          statusText: "Mode Malam",
          animation: "",
        };

      default:
        return {
          Icon: Sun,
          iconColor: "text-zinc-400",
          borderColor: "border-blue-500",
          glowColor: "bg-zinc-400",
          statusText: "Mendeteksi...",
          animation: "",
        };
    }
  };

  const weatherUI = getWeatherUI();
  const WeatherIcon = weatherUI.Icon;

  return (
    <Card className="rounded-2xl shadow-sm flex flex-col h-full w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">
          Clothesline Status
        </CardTitle>
        <CardDescription>
          Servo position & weather condition
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 w-full pb-6 h-full">
        
        {/* Wrapper Konten Utama yang otomatis mengisi ruang kosong */}
        <div className="flex flex-col flex-1 items-center justify-center w-full gap-6 py-4">
          
          {/* Animasi Lingkaran Servo */}
          <div className="relative flex items-center justify-center">
            <div className="relative flex items-center justify-center p-8">
              {/* Glow */}
              <div
                className={`absolute w-52 h-52 rounded-full opacity-20 blur-3xl transition-all duration-700 ${weatherUI.glowColor}`}
              />

              {/* Main Circle */}
              <div
                className={`
                  w-44 h-44
                  rounded-full
                  flex flex-col
                  items-center
                  justify-center
                  border-8
                  z-10
                  bg-zinc-100
                  dark:bg-zinc-900
                  transition-all
                  duration-500
                  ${weatherUI.borderColor}
                `}
              >
                {/* Weather Icon */}
                <WeatherIcon
                  className={`
                    w-14
                    h-14
                    ${weatherUI.iconColor}
                    ${weatherUI.animation}
                  `}
                />

                {/* Servo Status */}
                <span
                  className={`
                    text-2xl
                    font-extrabold
                    tracking-tight
                    mt-2
                    ${isInside ? "text-blue-500" : "text-green-500"}
                  `}
                >
                  {isInside ? "MASUK" : "KELUAR"}
                </span>

                {/* Servo Desc */}
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  {isInside ? "TERLINDUNGI" : "MENJEMUR"}
                </span>

                {/* Weather Label */}
                <span className="mt-2 text-xs font-medium text-center">
                  {weatherUI.statusText}
                </span>
              </div>
            </div>
          </div>

          {/* Banner Kondisi Lingkungan */}
          <div className="w-full p-4 rounded-xl border bg-background shadow-sm flex items-center justify-between transition-all duration-500">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Kondisi Lingkungan
              </span>
              <span className={`text-lg font-bold ${weatherUI.iconColor}`}>
                {kondisiCuaca || "Mendeteksi..."}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {(kondisiCuaca === "Mendung" || kondisiCuaca === "Gerimis" || kondisiCuaca === "Hujan Deras")
                  ? "Jemuran ditarik otomatis"
                  : "Sistem berjalan normal"}
              </span>
            </div>
            {/* <div className={`p-3 rounded-full bg-opacity-10 dark:bg-opacity-20 ${weatherUI.glowColor}`}>
              <WeatherIcon className={`w-6 h-6 ${weatherUI.iconColor} ${weatherUI.animation}`} />
            </div> */}
          </div>

        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 gap-4 w-full mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800">
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