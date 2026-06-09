"use client"

import { useState } from "react";
import { useMqtt } from "@/contexts/mqtt-context";
import { useDevice } from "@/contexts/device-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // atau komponen notifikasi bawaan Anda
import { Sun, CloudRain, Thermometer } from "lucide-react";

export function ConfigurationThreshold() {
  const { sendConfig } = useMqtt();
  const { activeDevice } = useDevice();
  const deviceId = activeDevice?.deviceId || null;

  // State untuk seluruh tingkatan threshold cuaca
  const [suhu, setSuhu] = useState(25);
  const [kelembaban, setKelembaban] = useState(80);
  
  const [ldrTerik, setLdrTerik] = useState(800);
  const [ldrBerawan, setLdrBerawan] = useState(1800);
  const [ldrMendung, setLdrMendung] = useState(2800);
  
  const [hujanKering, setHujanKering] = useState(3800);
  const [hujanGerimis, setHujanGerimis] = useState(2500);

  const handlePublishConfig = () => {
    if (!deviceId) {
      toast.error("Tidak ada device aktif yang terpilih");
      return;
    }

    // Validasi Logika Rentang agar tidak tumpang tindih (Sangat Penting!)
    if (Number(ldrTerik) >= Number(ldrBerawan) || Number(ldrBerawan) >= Number(ldrMendung)) {
      toast.error("Urutan threshold LDR salah! Harus: Terik < Berawan < Mendung");
      return;
    }
    if (Number(hujanGerimis) >= Number(hujanKering)) {
      toast.error("Urutan threshold Hujan salah! Harus: Gerimis < Kering");
      return;
    }

    const payload = {
      batasSuhu: Number(suhu),
      batasLembab: Number(kelembaban),
      ldrTerik: Number(ldrTerik),
      ldrBerawan: Number(ldrBerawan),
      ldrMendung: Number(ldrMendung),
      hujanKering: Number(hujanKering),
      hujanGerimis: Number(hujanGerimis),
    };

    sendConfig(payload);
    toast.success("Konfigurasi multi-threshold cuaca berhasil diterapkan!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan Threshold Cuaca</h1>
        <p className="text-sm text-muted-foreground">Sesuaikan sensitivitas pembacaan kondisi lingkungan secara real-time.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* GRUP SENSOR CAHAYA (LDR) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-yellow-500">
              <Sun className="w-5 h-5" />
              <CardTitle className="text-lg">Tingkatan Cahaya (LDR)</CardTitle>
            </div>
            <CardDescription>Makin kecil nilai ADC, kondisi lapangan makin terang benderang.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>Batas Cerah Terik ({ldrTerik})</span>
                <span className="text-muted-foreground">Zona: 0 - {ldrTerik}</span>
              </div>
              <input type="range" min="0" max="4095" value={ldrTerik} onChange={(e) => setLdrTerik(Number(e.target.value))} className="w-full accent-yellow-500" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>Batas Berawan Sebagian ({ldrBerawan})</span>
                <span className="text-muted-foreground">Zona: {ldrTerik + 1} - {ldrBerawan}</span>
              </div>
              <input type="range" min="0" max="4095" value={ldrBerawan} onChange={(e) => setLdrBerawan(Number(e.target.value))} className="w-full accent-orange-400" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>Batas Mendung Antisipasi ({ldrMendung})</span>
                <span className="text-muted-foreground">Zona: {ldrBerawan + 1} - {ldrMendung}</span>
              </div>
              <input type="range" min="0" max="4095" value={ldrMendung} onChange={(e) => setLdrMendung(Number(e.target.value))} className="w-full accent-slate-500" />
            </div>
          </CardContent>
        </Card>

        {/* GRUP SENSOR HUJAN */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-blue-500">
              <CloudRain className="w-5 h-5" />
              <CardTitle className="text-lg">Tingkatan Air Hujan</CardTitle>
            </div>
            <CardDescription>Makin kecil nilai ADC, intensitas air di sensor makin deras.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>Batas Mulai Gerimis / Ada Air ({hujanKering})</span>
                <span className="text-muted-foreground">Kering: &gt; {hujanKering}</span>
              </div>
              <input type="range" min="0" max="4095" value={hujanKering} onChange={(e) => setHujanKering(Number(e.target.value))} className="w-full accent-sky-400" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>Batas Masuk Hujan Deras ({hujanGerimis})</span>
                <span className="text-muted-foreground">Deras: &lt; {hujanGerimis}</span>
              </div>
              <input type="range" min="0" max="4095" value={hujanGerimis} onChange={(e) => setHujanGerimis(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GRUP CARD DHT (SUHU & KELEMBABAN) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-emerald-500">
            <Thermometer className="w-5 h-5" />
            <CardTitle className="text-lg">Suhu & Kelembaban (DHT11)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Batas Minimum Suhu ({suhu} °C)</label>
            <input type="range" min="15" max="40" value={suhu} onChange={(e) => setSuhu(Number(e.target.value))} className="w-full accent-emerald-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Batas Maksimum Kelembaban ({kelembaban} %)</label>
            <input type="range" min="50" max="100" value={kelembaban} onChange={(e) => setKelembaban(Number(e.target.value))} className="w-full accent-emerald-500" />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handlePublishConfig} size="lg" className="w-full h-12 rounded-xl bg-primary hover:bg-primary font-bold">
        Simpan Konfigurasi Cuaca Real-Time
      </Button>
    </div>
  );
}