"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
  Wind,
  ThermometerSun,
  Activity,
  Play,
  Square,
  Settings2,
  History,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const chartData = [
  { time: "00:00", temp: 24, humidity: 65, light: 0, rain: 0 },
  { time: "04:00", temp: 22, humidity: 70, light: 0, rain: 10 },
  { time: "08:00", temp: 26, humidity: 55, light: 40, rain: 0 },
  { time: "12:00", temp: 32, humidity: 40, light: 95, rain: 0 },
  { time: "16:00", temp: 30, humidity: 45, light: 80, rain: 0 },
  { time: "20:00", temp: 27, humidity: 50, light: 10, rain: 5 },
  { time: "24:00", temp: 25, humidity: 60, light: 0, rain: 0 },
];

export default function Dashboard() {
  const [servoMode, setServoMode] = useState("auto");
  const [servoState, setServoState] = useState("extended");
  const [time, setTime] = useState<Date | null>(null);

  // sensor data from /api/iot
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [latestSensor, setLatestSensor] = useState<any | null>(null);

  const formatNum = (v: any, digits = 1) => {
    if (v === undefined || v === null || Number.isNaN(Number(v))) return null;
    return Number(v).toFixed(digits);
  };

  useEffect(() => {
    const tick = () => setTime(new Date());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchSensor = async () => {
      try {
        const res = await fetch("/api/iot");
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        if (Array.isArray(data)) {
          setSensorData(data);
          // try to determine latest by timestamp-like fields
          const sorted = [...data].sort((a: any, b: any) => {
            const aT = a.timestamp ?? a.time ?? a.createdAt ?? a.ts ?? null;
            const bT = b.timestamp ?? b.time ?? b.createdAt ?? b.ts ?? null;
            const aDate = aT ? new Date(aT).getTime() : 0;
            const bDate = bT ? new Date(bT).getTime() : 0;
            return aDate - bDate;
          });
          setLatestSensor(sorted[sorted.length - 1] ?? data[data.length - 1]);
        }
      } catch (error) {
        console.error("Failed to fetch /api/iot", error);
      }
    };

    fetchSensor();
    const id = setInterval(fetchSensor, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between w-full px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Smart Clothesline</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-4">
              {/* HANYA render seluruh blok jam jika 'time' tidak null */}
              {time && (
                <div className="hidden sm:flex flex-col items-end justify-center h-full">
                  <div className="font-semibold text-sm text-foreground leading-tight">
                    {time.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium leading-tight">
                    {time.toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              )}
              <ModeToggle />
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                System Dashboard
              </h1>
              <p className="text-muted-foreground">
                Monitor and control your automated clothesline system.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium border border-green-200 dark:border-green-800">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                System Online
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg">
                Overview
              </TabsTrigger>
              <TabsTrigger value="control" className="rounded-lg">
                Servo Control
              </TabsTrigger>
              <TabsTrigger value="config" className="rounded-lg">
                Configuration
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="overview"
              className="space-y-6 animate-in fade-in-50"
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-950 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full z-0" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10">
                    <CardTitle className="text-sm font-medium text-zinc-500">
                      Temperature
                    </CardTitle>
                    <ThermometerSun className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent className="z-10">
                    <div className="text-3xl font-bold">
                      {latestSensor
                        ? formatNum(latestSensor.suhu)
                          ? `${formatNum(latestSensor.suhu)}°C`
                          : "—"
                        : "—"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {latestSensor ? "Live" : "No data"}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-950 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full z-0" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10">
                    <CardTitle className="text-sm font-medium text-zinc-500">
                      Humidity
                    </CardTitle>
                    <Wind className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent className="z-10">
                    <div className="text-3xl font-bold">
                      {latestSensor
                        ? formatNum(latestSensor.lembab)
                          ? `${formatNum(latestSensor.lembab)}%`
                          : "—"
                        : "—"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {latestSensor ? "Live" : "No data"}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-950 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full z-0" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10">
                    <CardTitle className="text-sm font-medium text-zinc-500">
                      Light Level (LDR)
                    </CardTitle>
                    <Sun className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent className="z-10">
                    <div className="text-3xl font-bold">
                      {latestSensor
                        ? formatNum(latestSensor.ldr, 0)
                          ? `${formatNum(latestSensor.ldr, 0)} lux`
                          : "—"
                        : "—"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {latestSensor
                        ? Number(latestSensor.ldr) > 500
                          ? "Bright"
                          : "Normal"
                        : "No data"}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-950 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full z-0" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10">
                    <CardTitle className="text-sm font-medium text-zinc-500">
                      Rain Intensity
                    </CardTitle>
                    <CloudRain className="h-4 w-4 text-cyan-500" />
                  </CardHeader>
                  <CardContent className="z-10">
                    <div className="text-3xl font-bold">
                      {latestSensor
                        ? (() => {
                            const r = latestSensor.hujan;
                            if (r === null || r === undefined) return "—";
                            if (typeof r === "number")
                              return `${formatNum(r)} mm/h`;
                            if (typeof r === "boolean")
                              return r ? "Raining" : "Clear";
                            return String(r);
                          })()
                        : "—"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {latestSensor
                        ? Number(latestSensor.hujan ?? 0) > 0
                          ? "Raining"
                          : "No rain detected"
                        : "No data"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 w-full">
                <Card className="md:col-span-2 lg:col-span-4 rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-950">
                  <CardHeader>
                    <CardTitle>Hourly Sensor Data</CardTitle>
                    <CardDescription>
                      Temperature, Humidity and Light progression.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-0 pb-4 w-full">
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={chartData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorTemp"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#f59e0b"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="#f59e0b"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="time"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                          />
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e5e7eb"
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "8px",
                              border: "none",
                              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="temp"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorTemp)"
                          />
                          <Area
                            type="monotone"
                            dataKey="humidity"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={0.1}
                            fill="#3b82f6"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 lg:col-span-3 rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-950">
                  <CardHeader>
                    <CardTitle>Servo Status</CardTitle>
                    <CardDescription>
                      Current clothesline position
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center h-70">
                    <div
                      className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border-8 ${servoState === "extended" ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20" : "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"} transition-all duration-500`}
                    >
                      <Sun
                        className={`w-12 h-12 ${servoState === "extended" ? "text-amber-500" : "text-zinc-400"} mb-2`}
                      />
                      <span className="font-bold text-lg">
                        {servoState === "extended" ? "EXTENDED" : "RETRACTED"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {servoState === "extended" ? "(Drying)" : "(Protected)"}
                      </span>
                    </div>
                    <div className="mt-8 flex gap-4 w-full">
                      <div className="flex-1 text-center">
                        <div className="text-sm font-medium text-muted-foreground">
                          Mode
                        </div>
                        <div className="font-semibold capitalize">
                          {servoMode}
                        </div>
                      </div>
                      <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-800" />
                      <div className="flex-1 text-center">
                        <div className="text-sm font-medium text-muted-foreground">
                          Last Action
                        </div>
                        <div className="font-semibold">10 mins ago</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent
              value="control"
              className="space-y-6 animate-in fade-in-50"
            >
              <Card className="rounded-2xl border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Servo Motor Control</CardTitle>
                  <CardDescription>
                    Manage how the clothesline operates based on conditions or
                    schedule.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Operation Mode</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div
                        className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all ${servoMode === "auto" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-zinc-200 dark:border-zinc-800 hover:border-blue-300"}`}
                        onClick={() => setServoMode("auto")}
                      >
                        <Activity
                          className={`w-8 h-8 ${servoMode === "auto" ? "text-blue-500" : "text-zinc-400"}`}
                        />
                        <div className="text-center">
                          <div className="font-semibold">Automatic</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Sensor driven
                          </div>
                        </div>
                      </div>
                      <div
                        className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all ${servoMode === "manual" ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-zinc-200 dark:border-zinc-800 hover:border-amber-300"}`}
                        onClick={() => setServoMode("manual")}
                      >
                        <Settings2
                          className={`w-8 h-8 ${servoMode === "manual" ? "text-amber-500" : "text-zinc-400"}`}
                        />
                        <div className="text-center">
                          <div className="font-semibold">Manual</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            User controlled
                          </div>
                        </div>
                      </div>
                      <div
                        className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all ${servoMode === "timer" ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : "border-zinc-200 dark:border-zinc-800 hover:border-purple-300"}`}
                        onClick={() => setServoMode("timer")}
                      >
                        <History
                          className={`w-8 h-8 ${servoMode === "timer" ? "text-purple-500" : "text-zinc-400"}`}
                        />
                        <div className="text-center">
                          <div className="font-semibold">Timer</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Schedule based
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {servoMode === "manual" && (
                    <div className="space-y-4 animate-in slide-in-from-top-4">
                      <h3 className="text-lg font-medium">Manual Override</h3>
                      <div className="flex gap-4">
                        <Button
                          size="lg"
                          variant={
                            servoState === "extended" ? "default" : "outline"
                          }
                          className="flex-1 h-14"
                          onClick={() => setServoState("extended")}
                        >
                          <Play className="w-5 h-5 mr-2" /> Extend (Dry)
                        </Button>
                        <Button
                          size="lg"
                          variant={
                            servoState === "retracted" ? "default" : "outline"
                          }
                          className="flex-1 h-14"
                          onClick={() => setServoState("retracted")}
                        >
                          <Square className="w-5 h-5 mr-2" /> Retract (Protect)
                        </Button>
                      </div>
                    </div>
                  )}

                  {servoMode === "timer" && (
                    <div className="space-y-4 animate-in slide-in-from-top-4 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <h3 className="text-lg font-medium">Schedule Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Extend Time (Out)</Label>
                          <Input
                            type="time"
                            defaultValue="07:00"
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Retract Time (In)</Label>
                          <Input
                            type="time"
                            defaultValue="18:00"
                            className="h-12"
                          />
                        </div>
                      </div>
                      <Button className="w-full">Save Schedule</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="config"
              className="space-y-6 animate-in fade-in-50"
            >
              <Card className="rounded-2xl border-none shadow-sm">
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

              <Card className="rounded-2xl border-none shadow-sm">
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
      </SidebarInset>
    </SidebarProvider>
  );
}
