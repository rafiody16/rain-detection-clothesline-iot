"use client";

import { useEffect, useState } from "react";
import ControlPage from "@/components/dashboard/control";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/layout";

export default function Control() {
  const [currentStatus, setCurrentStatus] = useState<"extended" | "retracted" | "moving">("retracted");

  const fetchCurrentStatus = async () => {
    try {
      const res = await fetch("/api/iot");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const latest = data[0];
        setCurrentStatus(latest.servo === 1 ? "extended" : "retracted");
      }
    } catch (err) {
      console.error("Failed to fetch status");
    }
  };

  useEffect(() => {
    fetchCurrentStatus();
  }, []);

  const handleSendCommand = async (command: "extend" | "retract") => {
    const value = command === "extend" ? 1 : 0;

    const postPromise = fetch("/api/iot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ servo: value }),
    }).then(async (res) => {
      if (!res.ok) throw new Error("Failed");
      setCurrentStatus(command === "extend" ? "extended" : "retracted");
      return res.json();
    });

    toast.promise(postPromise, {
      loading: `Sending ${command} command to hardware...`,
      success: `Hardware updated to ${command} position`,
      error: "Communication error with microcontroller",
    });
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Control Panel" },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <ControlPage
        currentStatus={currentStatus}
        onCommand={handleSendCommand}
      />
    </DashboardLayout>
  );
}