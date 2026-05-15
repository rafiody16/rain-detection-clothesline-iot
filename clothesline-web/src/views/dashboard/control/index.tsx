"use client"

import { ServoControl } from "@/components/custom/servo-control"

export default function ControlPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-4">
      <ServoControl />
    </div>
  )
}