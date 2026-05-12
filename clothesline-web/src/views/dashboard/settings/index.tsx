"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings2 } from "lucide-react"

export default function SettingsPage() {
  return (
    <>
        <div className="flex flex-1 flex-col gap-6 p-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-lg">
              <Settings2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
              <p className="text-muted-foreground">Global settings and alert preferences.</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Configure notifications and system behaviors.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Notification preferences have been moved to the main dashboard Configuration tab for easier access. Future updates will include Email and SMS gateway configuration here.</p>
            </CardContent>
          </Card>
        </div>
    </>
  )
}
