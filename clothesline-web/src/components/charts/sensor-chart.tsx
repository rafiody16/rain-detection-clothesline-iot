"use client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { SwitchBadge } from "../ui/switch-badge";

interface SensorChartProps {
    data: any[];
    config: {
        key: string;
        name: string;
        color: string;
        gradientId: string;
        unit: string;
    }[];
    title: string;
    desc?: string;
    isOnline: boolean;
}

export function SensorChart({ data, config, title, desc, isOnline }: SensorChartProps) {
    return (
        <Card className="rounded-2xl shadow-sm overflow-hidden radius-sm">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold">{title}</CardTitle>
                        <CardDescription className="text-xs">{desc}</CardDescription>
                    </div>
                    {isOnline ? (
                        <SwitchBadge status="live" />
                    ) : (
                        <SwitchBadge status="off" />
                    )
                    }
                </div>
            </CardHeader>
            <CardContent className="pl-0 pr-0 pb-0">
                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                {config.map(c => (
                                    <linearGradient key={c.gradientId} id={c.gradientId} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={c.color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={c.color} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>

                            {/* Grid halus membuat chart terlihat lebih teknis */}
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />

                            <XAxis
                                dataKey="timestampValue"
                                type="number"
                                domain={['dataMin', 'dataMax']}
                                scale="time"
                                tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={100} // Hanya tampilkan waktu di ujung-ujung saja
                                padding={{ left: 20, right: 20 }}
                            />

                            <YAxis
                                fontSize={10}
                                axisLine={false}
                                tickLine={false}
                                // BIKIN DINAMIS: Supaya gerakan suhu terasa 'hidup'
                                domain={['dataMin - 1', 'dataMax + 1']}
                                tickFormatter={v => `${v}${config[0]?.unit}`}
                            />

                            <Tooltip
                                cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                                contentStyle={{
                                    borderRadius: "12px",
                                    border: "none",
                                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                    fontSize: "12px"
                                }}
                                labelFormatter={v => `Time: ${new Date(v).toLocaleTimeString()}`}
                            />

                            {config.map(c => (
                                <Area
                                    key={c.key}
                                    type="monotone" // Gunakan monotone agar garis melengkung cantik
                                    dataKey={c.key}
                                    stroke={c.color}
                                    fill={`url(#${c.gradientId})`}
                                    strokeWidth={3}
                                    isAnimationActive={false} // Wajib false untuk live data agar tidak lompat-lompat
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}