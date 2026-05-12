import Dashboard from "@/components/dashboard";
import { CloudRain, Sun, ThermometerSun, Wind } from "lucide-react";
import { formatNum } from "@/lib/format-number";
import DashboardLayout from "@/components/dashboard/layout";
import { useMqtt } from "@/contexts/mqtt-context";

const DashboardContent = () => {
    const { latestData, rawHistory, isOnline } = useMqtt();
    console.log("Latest Data:", latestData);
    console.log("Raw History:", rawHistory);

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
            desc: Number(latestData?.ldr) > 1600 ? "Dark" : "Normal"
        },
        {
            id: `rain-${latestData?.intensitasAir}`,
            title: "Rain Status",
            value: Number(latestData?.intensitasAir ?? 0) < 3000
                ? "Raining"
                : "Not Raining",
            icon: <CloudRain className="h-4 w-4 text-cyan-500" />,
            color: "bg-cyan-500/10",
            desc: Number(latestData?.intensitasAir ?? 0) < 3000
                ? "Rain detected"
                : "No rain detected",
        },
    ];

    return (
        <Dashboard isOnline={isOnline} latestData={latestData} chartData={rawHistory} stats={stats} />
    );
};

const Homepage = () => {
    const breadcrumbs = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Smart Clothesline" },
    ];

    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <DashboardContent />
        </DashboardLayout>
    );
};

export default Homepage;