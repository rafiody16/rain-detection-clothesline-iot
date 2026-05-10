import Dashboard from "@/components/dashboard";
import { connectMQTT } from "@/utils/mqtt";
import { set } from "date-fns";
import { useEffect, useState, useMemo } from "react";
import { subHours, subDays, subWeeks, subMonths, subYears, isAfter } from "date-fns";
import { CloudRain, Sun, ThermometerSun, Wind } from "lucide-react";
import { formatNum } from "@/lib/format-number";
const Homepage = () => {
    const [isOnline, setIsOnline] = useState<boolean>(false);
    const [latestData, setLatestData] = useState<any>(null);
    const [rawHistory, setRawHistory] = useState<any[]>([]);

    const normalize = (item: any) => ({
        timestampValue: Date.now(), // Gunakan waktu lokal saat data diterima
        suhu: item.suhu ?? item.temperature ?? 0,
        lembab: item.lembab ?? item.humidity ?? 0,
        ldr: item.ldr ?? item.light ?? 0,
        hujan: item.hujan ?? item.rain ?? false,
    });

    useEffect(() => {
    let lastDataTimestamp = Date.now();

    const heartbeatCheck = setInterval(() => {
        const now = Date.now();
        if (now - lastDataTimestamp > 10000) {
            setIsOnline(false);
        }
    }, 5000); 

    const client = connectMQTT((topic, message) => {
        const msgStr = message.toString();
        if (topic === 'jemuran/status') {
            if (msgStr.includes("Online")) {
                setIsOnline(true);
                lastDataTimestamp = Date.now(); 
            } else if (msgStr.includes("Offline")) {
                setIsOnline(false);
            }
        }
        
        if (topic === 'jemuran/data') {
            lastDataTimestamp = Date.now(); 
            setIsOnline(true); 

            try {
                const parsed = normalize(JSON.parse(msgStr));
                setLatestData(parsed);
                setRawHistory(prev => [...prev, parsed].slice(-200));
            } catch (e) { 
                console.error("Parse error:", e); 
            }
        }
    });

    return () => { 
        clearInterval(heartbeatCheck); 
        client?.end(); 
    };
}, []);
    const stats = [
        {
            title: "Temperature",
            value: formatNum(latestData?.suhu) ? `${formatNum(latestData.suhu)}°C` : "—",
            icon: <ThermometerSun className="h-4 w-4 text-amber-500" />,
            color: "bg-amber-500/10",
            desc: latestData ? "Live" : "No data"
        },
        {
            title: "Humidity",
            value: formatNum(latestData?.lembab) ? `${formatNum(latestData.lembab)}%` : "—",
            icon: <Wind className="h-4 w-4 text-blue-500" />,
            color: "bg-blue-500/10",
            desc: latestData ? "Live" : "No data"
        },
        {
            title: "Light Level (LDR)",
            value: formatNum(latestData?.ldr, 0) ? `${formatNum(latestData.ldr, 0)} lux` : "—",
            icon: <Sun className="h-4 w-4 text-yellow-500" />,
            color: "bg-yellow-500/10",
            desc: Number(latestData?.ldr) > 500 ? "Bright" : "Normal"
        },
        {
            title: "Rain Intensity",
            value: latestData?.hujan === true ? "Raining" : latestData?.hujan === false ? "Clear" : "—",
            icon: <CloudRain className="h-4 w-4 text-cyan-500" />,
            color: "bg-cyan-500/10",
            desc: latestData?.hujan ? "Raining" : "No rain"
        }
    ]


    return (
        <div>
            <Dashboard isOnline={isOnline} latestData={latestData} chartData={rawHistory} stats={stats} />
        </div>
    );
};

export default Homepage;