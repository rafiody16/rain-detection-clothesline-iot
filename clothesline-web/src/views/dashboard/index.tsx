"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  CloudRain,
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
import { StatusCard } from "@/components/custom/servo-status-card"; // Pastikan nama file/path sudah sesuai

export default function Dashboard() {
  const { latestData, rawHistory: chartData, isOnline, lastActionData } = useMqtt();
  
  // LOGIKA GABUNGAN: LDR + WAKTU (FRONTEND)
  const getRealKondisi = () => {
    const kondisiRaw = latestData?.kondisi || "Mendeteksi...";
    
    // Ambil jam saat ini dari sistem/browser user (format 0-23)
    const currentHour = new Date().getHours();
    
    // Jika sensor mendeteksi gelap, tapi masih antara jam 06:00 pagi - 17:59 sore
    if (kondisiRaw === "Malam/Gelap" && currentHour >= 6 && currentHour < 18) {
      return "Mendung"; // Berarti gelap karena mendung pekat (antisipasi hujan)
    }
    
    return kondisiRaw;
  };

  // Terapkan kondisi yang sudah diproses
  const kondisiCuaca = getRealKondisi();

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

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const timeString = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).replace(/\./g, ':');

    if (isToday) {
      return `Hari ini, ${timeString}`;
    } else {
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
            {/* 1. SENSOR STATS */}
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

            {/* 2. MAIN CHARTS & SERVO STATUS */}
            <div className="grid gap-6 lg:grid-cols-3 items-stretch">

              {/* Kolom Kiri & Tengah: Charts (Temperature, Humidity, Light Level) */}
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

                <SensorChart
                  data={chartData}
                  title="Light Level"
                  desc="Current ambient light intensity"
                  config={[{ key: "ldr", name: "Light", color: "#eab308", gradientId: "g-ldr", unit: "lux" }]}
                  isOnline={isOnline}
                />
              </div>

              {/* Kolom Kanan: Servo Status & Kondisi Lingkungan */}
              <div className="order-1 lg:order-2 lg:col-span-1 flex h-full">
                <StatusCard
                  lastActionData={lastActionData}
                  kondisiCuaca={kondisiCuaca}
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