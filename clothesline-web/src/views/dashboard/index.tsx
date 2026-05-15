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
  Sun,
  ThermometerSun,
  Wind,
} from "lucide-react";
import { ServoControl } from "@/components/custom/servo-control";
import { SensorChart } from "@/components/custom/sensor-chart";
import { useMqtt } from "@/contexts/mqtt-context";
import { formatNum } from "@/lib/format-number";
import { StatCard } from "@/components/custom/stat-card";
import { StatusCard } from "@/components/custom/servo-status-card";

export default function Dashboard() {
  const { latestData, rawHistory: chartData, isOnline, lastActionData } = useMqtt();

  const stats = [
    {
      title: "Temperature",
      value: formatNum(latestData?.suhu) ? `${formatNum(latestData.suhu)}°C` : "—",
      icon: <ThermometerSun className="h-4 w-4 text-amber-500" />,
      color: "bg-amber-500/10",
      desc: latestData ? "Live" : "No data"
    },
    {
      title: "Humidity",
      value: formatNum(latestData?.lembab) ? `${formatNum(latestData.lembab)}%` : "—",
      icon: <Wind className="h-4 w-4 text-blue-500" />,
      color: "bg-blue-500/10",
      desc: latestData ? "Live" : "No data"
    },
    {
      title: "Light Level (LDR)",
      value: formatNum(latestData?.ldr, 0) ? `${formatNum(latestData.ldr, 0)} lux` : "—",
      icon: <Sun className="h-4 w-4 text-yellow-500" />,
      color: "bg-yellow-500/10",
      desc: Number(latestData?.ldr) > 1600 ? "Dark" : "Normal"
    },
    {
      id: `rain-${latestData?.intensitasAir}`,
      title: "Rain Status",
      value: formatNum(latestData?.intensitasAir, 0) ? `${formatNum(latestData.intensitasAir, 0)}` : "—",
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
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 pt-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="control">Servo Control</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-in fade-in-50">
            {/* 1. SENSOR STATS - Tetap 4 kolom di layar besar */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

            {/* 2. MAIN CHARTS & SERVO STATUS - Layout Grid Campuran */}
            <div className="grid gap-6 lg:grid-cols-3">

              {/* Kolom Kiri & Tengah: Charts (Temperature & Humidity) */}
              <div className="lg:col-span-2 space-y-6">
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
              <div className="lg:col-span-1">
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
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Sensor Thresholds</CardTitle>
                <CardDescription>
                  Configure the trigger points for automatic retraction and
                  extension.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6 bg-amber-50 dark:bg-amber-900/10 p-6 rounded-xl border border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-center gap-2 mb-4">
                      <ThermometerSun className="w-5 h-5 text-amber-500" />
                      <h3 className="text-lg font-medium">
                        Temperature & Humidity
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <Label>Min Temperature (°C)</Label>
                      <Input type="number" defaultValue="25" />
                      <p className="text-xs text-muted-foreground">
                        Clothesline extends if above this temperature.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Label>Max Humidity (%)</Label>
                      <Input type="number" defaultValue="70" />
                      <p className="text-xs text-muted-foreground">
                        Clothesline retracts if above this humidity.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6 bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center gap-2 mb-4">
                      <CloudRain className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-medium">
                        Rain & Light (LDR)
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <Label>Rain Sensitivity (Intensity)</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue placeholder="Select sensitivity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">
                            High (Any Drop)
                          </SelectItem>
                          <SelectItem value="medium">
                            Medium (Drizzle)
                          </SelectItem>
                          <SelectItem value="low">
                            Low (Heavy Rain)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label>Min Light Intensity (Lux)</Label>
                      <Input type="number" defaultValue="300" />
                      <p className="text-xs text-muted-foreground">
                        Clothesline retracts if light goes below this (Night
                        mode).
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 rounded-b-2xl border-t border-zinc-200 dark:border-zinc-800 p-6">
                <div className="flex items-center justify-between w-full">
                  <p className="text-sm text-muted-foreground">
                    Changes to thresholds apply immediately in Auto Mode.
                  </p>
                  <Button>Save Configuration</Button>
                </div>
              </CardFooter>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Data Recording Frequency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-w-md">
                  <Label>Log sensor data every:</Label>
                  <Select defaultValue="60">
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Minutes</SelectItem>
                      <SelectItem value="15">15 Minutes</SelectItem>
                      <SelectItem value="30">30 Minutes</SelectItem>
                      <SelectItem value="60">1 Hour</SelectItem>
                      <SelectItem value="120">2 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
