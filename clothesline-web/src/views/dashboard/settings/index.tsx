"use client"

import { ConfigurationThreshold } from "@/components/custom/config-threshold"

export default function ControlPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-4">
      < ConfigurationThreshold />
    </div>
  )
}