"use client";

import { useState, useEffect } from "react";
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
import { SensorChart } from "../charts/sensor-chart";
import { Badge } from "../ui/badge";
import { px } from "motion/react";
import { DashboardHeader } from "../dashboard-header";
import { useDateTime } from "@/hooks/use-date-time";
import { useMqtt } from "@/contexts/mqtt-context";

interface DashboardProps {
  isOnline: boolean;
  latestData: any;
  chartData: any[];
  stats?: any[];
}

export default function Dashboard({ isOnline, latestData, chartData, stats }: DashboardProps) {
  const [servoMode, setServoMode] = useState<"auto" | "manual" | "timer">("auto");
  const [servoState, setServoState] = useState<"extended" | "retracted">("retracted");

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
                  <Card key={i} className="rounded-2xl border-none shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-zinc-500">{stat.title}</CardTitle>
                      <div className={`p-2 rounded-lg ${stat.color.replace('bg-', 'text-').replace('/10', '')} bg-zinc-100 dark:bg-zinc-900`}>
                        {stat.icon}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        {stat.desc}
                      </p>
                    </CardContent>
                  </Card>
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
                  <Card className="rounded-2xl border-none shadow-sm h-full">
                    <CardHeader>
                      <CardTitle>Servo Status</CardTitle>
                      <CardDescription>Clothesline position</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-between pb-8">
                      <div className="relative flex items-center justify-center mt-4">
                        {/* Background Circle Decorative */}
                        <div className={`absolute w-48 h-48 rounded-full opacity-10 blur-2xl ${servoState === "extended" ? "bg-amber-500" : "bg-zinc-500"}`} />

                        <div className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border-8 z-10 transition-all duration-700 ${servoState === "extended"
                          ? "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                          : "border-zinc-200 dark:border-zinc-800 "
                          }`}>
                          <Sun className={`w-12 h-12 ${servoState === "extended" ? "text-amber-500" : "text-zinc-400"} mb-1`} />
                          <span className="font-black text-xl tracking-tight">
                            {servoState === "extended" ? "EXTENDED" : "RETRACTED"}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">
                            {servoState === "extended" ? "Drying Mode" : "Safe Mode"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 w-full mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase">System Mode</p>
                          <p className="font-bold capitalize text-sm">{servoMode}</p>
                        </div>
                        <div className="text-center border-l border-zinc-100 dark:border-zinc-800">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase">Last Action</p>
                          <p className="font-bold text-sm">10m ago</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

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
        </>
  );
}
