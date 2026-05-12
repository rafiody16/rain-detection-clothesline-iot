"use client";

import { useEffect, useState } from "react";
import ControlPage from "@/views/dashboard/control";
import { toast } from "sonner";
import DashboardLayout from "@/views/dashboard/layout";
import mqtt from "mqtt";

export default function Control() {
  const [client, setClient] = useState(null);
  const [statusAlat, setStatusAlat] = useState("Menunggu data...");
  const [sensorData, setSensorData] = useState({
    suhu: 0,
    lembab: 0,
    ldr: 0,
    intensitasAir: 0,
    cuacaBuruk: 0,
    mode: "AUTO"
  });

  useEffect(() => {
    const brokerUrl = 'ws://3.107.238.64:9001';
    const mqttClientObj = mqtt.connect(brokerUrl);

    setClient(mqttClientObj);

    mqttClientObj.on("connect", () => {
      console.log("Connected to MQTT broker");
      mqttClientObj.subscribe('jemuran/data');
      mqttClientObj.subscribe('jemuran/status');
    });

    mqttClientObj.on("message", (topic, message) => {
      const payload = message.toString();
      if (topic === 'jemuran/data') {
        try{
          const parsedData = JSON.parse(payload);
          setSensorData(parsedData);
        } catch (error) {
          console.error("Failed to parse sensor data:", error);
        }
      } else if (topic === 'jemuran/status') {
        setStatusAlat(payload);
      }
    });

    return () => {
      if (mqttClientObj) {
        mqttClientObj.end();
      }
    }
  }, []);

  const kirimPerintah = (perintah) => {
    if (client) {
      client.publish('jemuran/kontrol', perintah);
      toast.success(`Perintah "${perintah}" berhasil dikirim!`);
    } else {
      toast.error("Koneksi MQTT belum terhubung. Coba lagi nanti.");
    }
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Control Panel" },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <ControlPage
        currentStatus={statusAlat} 
        onCommand={kirimPerintah}
      />
    </DashboardLayout>
  );
}