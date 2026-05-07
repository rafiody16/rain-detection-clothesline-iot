"use client"

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Clock, Droplets, RotateCcw } from "lucide-react"

interface AnalyticsPageStats {
  title: string;
  description: string;
  value: string | number;
  unit?: string;
  footer: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

export default function AnalyticsPage({ stats }: { stats: AnalyticsPageStats[] }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Analytics</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <ModeToggle />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 p-6">
          {/* Header Section */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
              <p className="text-muted-foreground">Real-time usage statistics and sensor history.</p>
            </div>
          </div>

          {/* 3. Grid Card Dinamis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats?.length > 0 ? (
              stats.map((stat, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      <CardDescription className="text-xs">{stat.description}</CardDescription>
                    </div>
                    <div className={`p-2 rounded-md ${stat.colorClass}`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {stat.value}
                      {stat.unit && (
                        <span className="ml-1 text-sm font-normal text-muted-foreground">
                          {stat.unit}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {stat.footer}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                No analytics data available.
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
