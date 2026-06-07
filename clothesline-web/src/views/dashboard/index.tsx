"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CloudRain,
  Cloud,
  CloudFog,
  Moon,
  CloudDrizzle,
  Sun,
  ThermometerSun,
  Wind,
} from "lucide-react";
import { ServoControl } from "@/components/custom/servo-control";
import { ConfigurationThreshold } from "@/components/custom/config-threshold";
import { SensorChart } from "@/components/custom/sensor-chart";
import { useMqtt } from "@/contexts/mqtt-context";
import { formatNum } from "@/lib/format-number";
import { StatCard } from "@/components/custom/stat-card";
import { StatusCard } from "@/components/custom/servo-status-card";

// Fungsi untuk mendapatkan konfigurasi ikon, warna, dan label cuaca
const getWeatherConfig = (kondisi: string) => {
  switch (kondisi) {
    case "Cerah Terik":
      return { 
        icon: Sun, 
        color: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900/50", 
        label: "Cerah Terik" 
      };
    case "Berawan":
      return { 
        icon: Cloud, 
        color: "text-slate-400 bg-slate-100 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800/50", 
        label: "Berawan Sebagian" 
      };
    case "Mendung":
      return { 
        icon: CloudFog, 
        color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50", 
        label: "Mendung (Antisipasi)" 
      };
    case "Malam/Gelap":
      return { 
        icon: Moon, 
        color: "text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50", 
        label: "Malam / Gelap" 
      };
    case "Gerimis":
      return { 
        icon: CloudDrizzle, 
        color: "text-sky-500 bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/50", 
        label: "Gerimis" 
      };
    case "Hujan Deras":
      return { 
        icon: CloudRain, 
        color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-900/60 animate-pulse", 
        label: "Hujan Deras" 
      };
    default:
      return { 
        icon: Sun, 
        color: "text-muted-foreground bg-muted border-transparent", 
        label: "Mendeteksi..." 
      };
  }
};

export default function Dashboard() {
  const { latestData, rawHistory: chartData, isOnline, lastActionData } = useMqtt();
  const kondisiCuaca = latestData?.kondisi || "Mendeteksi...";
  const weather = getWeatherConfig(kondisiCuaca);
  const WeatherIcon = weather.icon;

  const stats = [
    {
      title: "Temperature",
      value: formatNum(latestData?.suhu) ? `${formatNum(latestData?.suhu)}°C` : "—",
      icon: <ThermometerSun className="h-4 w-4 text-amber-500" />,
      color: "bg-amber-500/10",
      desc: latestData ? "Live" : "No data"
    },
    {
      title: "Humidity",
      value: formatNum(latestData?.lembab) ? `${formatNum(latestData?.lembab)}%` : "—",
      icon: <Wind className="h-4 w-4 text-blue-500" />,
      color: "bg-blue-500/10",
      desc: latestData ? "Live" : "No data"
    },
    {
      title: "Light Level (LDR)",
      value: formatNum(latestData?.ldr, 0) ? `${formatNum(latestData?.ldr, 0)} lux` : "—",
      icon: <Sun className="h-4 w-4 text-yellow-500" />,
      color: "bg-yellow-500/10",
      desc: Number(latestData?.ldr) > 2000 ? "Dark" : "Normal"
    },
    {
      id: `rain-${latestData?.intensitasAir}`,
      title: "Rain Intensity",
      value: formatNum(latestData?.intensitasAir, 0) ? `${formatNum(latestData?.intensitasAir, 0)}` : "—",
      icon: <CloudRain className="h-4 w-4 text-cyan-500" />,
      color: "bg-cyan-500/10",
      desc: Number(latestData?.intensitasAir ?? 0) < 3000
        ? "Rain detected"
        : "No rain detected",
    },
  ];

  const formatSmartTime = (timestampValue?: number) => {
    if (!timestampValue) return "--:--";

    const date = new Date(timestampValue);
    const now = new Date();

    // Cek apakah hari, bulan, dan tahunnya sama dengan hari ini
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    // Ambil jam & menit (Contoh: "15:53")
    const timeString = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).replace(/\./g, ':'); // Mengubah format titik 15.53 jadi titik dua 15:53 agar lebih standar

    if (isToday) {
      // Jika hari ini, tampilkan "Hari ini, 15:53" atau cukup jamnya saja
      return `Hari ini, ${timeString}`;
    } else {
      // Jika bukan hari ini, tampilkan tanggal ringkas "13 Mei, 15:53"
      const dateString = date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
      return `${dateString}, ${timeString}`;
    }
  };
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-3 md:p-8 pt-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList variant="line" className="flex justify-start overflow-x-auto no-scrollbar">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="control">Servo Control</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-in fade-in-50">
            {/* 1. SENSOR STATS - Tetap 4 kolom di layar besar */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats?.map((stat, i) => (
                <StatCard
                  key={i}
                  title={stat.title}
                  value={stat.value}
                  desc={stat.desc}
                  icon={stat.icon}
                  color={stat.color}
                />
              ))}
            </div>

            <Card className={`border ${weather.color} transition-all duration-300`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <span className="text-sm font-medium uppercase tracking-wider opacity-80">
                    Kondisi Lingkungan
                  </span>
                  <WeatherIcon className="h-6 w-6" />
                </div>
                <div className="mt-2">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {weather.label}
                  </h2>
                  <p className="text-xs opacity-70 mt-1">
                    {kondisiCuaca === "Mendung" ? "Jemuran otomatis ditarik masuk" : "Sistem berjalan normal"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 2. MAIN CHARTS & SERVO STATUS - Layout Grid Campuran */}
            <div className="grid gap-6 lg:grid-cols-3 lg:items-start">

              {/* Kolom Kiri & Tengah: Charts (Temperature & Humidity) */}
              <div className="order-2 lg:order-1 lg:col-span-2 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <SensorChart
                    data={chartData}
                    title="Temperature"
                    config={[{ key: "suhu", name: "Temp", color: "#3b82f6", gradientId: "g-suhu", unit: "°C" }]}
                    isOnline={isOnline}
                  />
                  <SensorChart
                    data={chartData}
                    title="Humidity"
                    config={[{ key: "lembab", name: "Hum", color: "#a855f7", gradientId: "g-lembab", unit: "%" }]}
                    isOnline={isOnline}
                  />
                </div>

                {/* Light Level mengambil lebar penuh di kolom chart */}
                <SensorChart
                  data={chartData}
                  title="Light Level"
                  desc="Current ambient light intensity"
                  config={[{ key: "ldr", name: "Light", color: "#eab308", gradientId: "g-ldr", unit: "lux" }]}
                  isOnline={isOnline}
                />
              </div>

              {/* Kolom Kanan: Servo Status & Control Summary */}
              <div className="order-1 lg:order-2 lg:col-span-1">
                <StatusCard
                  lastActionData={lastActionData}
                  formatSmartTime={formatSmartTime}
                />
              </div>

            </div>
          </TabsContent>

          <TabsContent
            value="control"
            className="space-y-6 animate-in fade-in-50"
          >
            <ServoControl />
          </TabsContent>

          <TabsContent
            value="config"
            className="space-y-6 animate-in fade-in-50"
          >
            <ConfigurationThreshold />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
