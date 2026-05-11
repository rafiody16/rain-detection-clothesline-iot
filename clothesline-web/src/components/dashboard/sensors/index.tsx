"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"

export default function SensorsPage() {
  return (
    <>

        <div className="flex flex-1 flex-col gap-6 p-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Sensor Information</h1>
              <p className="text-muted-foreground">In-depth details about connected ESP32 sensors.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>DHT22</CardTitle>
                <CardDescription>Temperature & Humidity</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Measures ambient temperature and humidity accurately. Used to determine if the weather is warm and dry enough to push the clothesline out.</p>
                <div className="mt-4 p-4 rounded-lg bg-muted text-sm font-mono text-zinc-500">Pin: GPIO 4<br/>Status: ONLINE</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>LDR (Photoresistor)</CardTitle>
                <CardDescription>Light Intensity</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Detects sunlight presence. If it gets too dark, the clothesline will automatically retract to prevent laundry from getting damp from dew.</p>
                <div className="mt-4 p-4 rounded-lg bg-muted text-sm font-mono text-zinc-500">Pin: ADC 34<br/>Status: ONLINE</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rain Sensor</CardTitle>
                <CardDescription>Water Detection</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">An analog rain drop detector. Reacts instantly to precipitation and acts as the highest priority trigger to retract the laundry.</p>
                <div className="mt-4 p-4 rounded-lg bg-muted text-sm font-mono text-zinc-500">Pin: ADC 35<br/>Status: ONLINE</div>
              </CardContent>
            </Card>
          </div>
        </div>
        </>
  )
}
