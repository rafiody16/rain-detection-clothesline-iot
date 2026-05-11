"use client";
import AnalyticsPage from "@/components/dashboard/analytics";
import DashboardLayout from "@/components/dashboard/layout";
import { BarChart3, Droplets, RotateCcw } from "lucide-react";


const Analytics = () => {
  const dataStats = [
    {
      title: "Rata-rata Suhu",
      description: "24 Jam Terakhir",
      value: "28.5",
      unit: "°C",
      footer: "Suhu stabil dalam batas normal.",
      icon: BarChart3,
      colorClass: "bg-orange-100 text-orange-600 dark:bg-orange-900/30",
    },
    {
      title: "Kelembapan",
      description: "Kondisi Tanah",
      value: "75",
      unit: "%",
      footer: "Kelembapan optimal untuk tanaman.",
      icon: Droplets,
      colorClass: "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
    },
    {
      title: "Total Aktivitas Servo",
      description: "Penyiraman Otomatis",
      value: "12",
      unit: "kali",
      footer: "Sistem bekerja 12 kali hari ini.",
      icon: RotateCcw,
      colorClass: "bg-purple-100 text-purple-600 dark:bg-purple-900/30",
    },
    {
      title: "Total Aktivitas Servo",
      description: "Penyiraman Otomatis",
      value: "12",
      unit: "kali",
      footer: "Sistem bekerja 12 kali hari ini.",
      icon: RotateCcw,
      colorClass: "bg-purple-100 text-purple-600 dark:bg-purple-900/30",
    },
  ];
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Analytics" },
  ];
  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <AnalyticsPage stats={dataStats} />
    </DashboardLayout>
  )
}

export default Analytics
