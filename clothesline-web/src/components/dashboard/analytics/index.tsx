"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

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
    <>
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
        </>
  )
}
