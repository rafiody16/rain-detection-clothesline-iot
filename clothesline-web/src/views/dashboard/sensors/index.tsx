"use client"

import { useDevice } from "@/contexts/device-context"
import { useMqtt } from "@/contexts/mqtt-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"
import { SwitchBadge } from "@/components/ui/switch-badge"

const sensorItems = [
  {
    id: "dht11",
    title: "DHT11",
    description: "Temperature & Humidity",
    details:
      "Measures ambient temperature and humidity to help decide when the clothesline should move in or out.",
    pin: "GPIO 25",
  },
  {
    id: "ldr",
    title: "LDR (Photoresistor)",
    description: "Light Intensity",
    details:
      "Detects ambient light level. The system uses this to decide whether it is getting too dark for drying clothes outside.",
    pin: "ADC 34",
  },
  {
    id: "rain",
    title: "Rain Sensor",
    description: "Water Detection",
    details:
      "Reads the rain module output so the clothesline can retract as soon as precipitation is detected.",
    pin: "ADC 35",
  },
] as const

export default function SensorsPage() {
  const { activeDevice } = useDevice()
  const { isOnline } = useMqtt()
  const deviceStatus = !activeDevice ? "none" : isOnline ? "online" : "offline"

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

        <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 shadow-sm">
          <div>
            <p className="text-sm font-medium text-foreground">ESP32 device status</p>
            <p className="text-sm text-muted-foreground">
              {activeDevice ? `Device ${activeDevice.deviceId} is being monitored through MQTT.` : "Select a device to see live sensor status."}
            </p>
          </div>
          <SwitchBadge status={deviceStatus} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sensorItems.map((sensor) => (
            <Card key={sensor.id} id={sensor.id}>
              <CardHeader>
                <CardTitle>{sensor.title}</CardTitle>
                <CardDescription>{sensor.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{sensor.details}</p>
                <div className="mt-4 rounded-lg bg-muted p-4 text-sm font-mono text-zinc-500">
                  Pin: {sensor.pin}
                  <br />
                  Status: {activeDevice ? (isOnline ? "ONLINE" : "OFFLINE") : "NO DEVICE"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
