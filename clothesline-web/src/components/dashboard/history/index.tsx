"use client";

import { useState } from "react";
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
} from "@/components/ui/card";
import { History } from "lucide-react";

type HistoryPageProps = {
  logs: any[];
  isLoading?: boolean;
};

export default function HistoryPage({ logs, isLoading }: HistoryPageProps) {
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
                    <BreadcrumbPage>Historical Data</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <ModeToggle />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Historical Data
              </h1>
              <p className="text-muted-foreground">
                View past records of sensor readings and servo actions.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Data Log (Static Preview)</CardTitle>
              <CardDescription>
                A list of previous environmental readings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                    <tr>
                      <th className="px-6 py-3">Timestamp</th>
                      <th className="px-6 py-3">Temperature</th>
                      <th className="px-6 py-3">Humidity</th>
                      <th className="px-6 py-3">Light (Lux)</th>
                      <th className="px-6 py-3">Rain Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                          Loading historical data...
                        </td>
                      </tr>
                    ) : 
                    logs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                          No historical data available.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="px-6 py-4">{log.timestamp}</td>
                          <td className="px-6 py-4">{log.temperature} °C</td>
                          <td className="px-6 py-4">{log.humidity} %</td>
                          <td className="px-6 py-4">{log.light} lux</td>
                          <td className="px-6 py-4">
                            {log.rain ? (
                              <span className="text-red-500 font-medium">Rain Detected</span>
                            ) : (
                              <span className="text-green-500 font-medium">No Rain</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
