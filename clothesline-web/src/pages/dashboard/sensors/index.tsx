import DashboardLayout from "@/components/dashboard/layout";
import SensorsPage from "@/components/dashboard/sensors";

const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Sensors" },
];

const Sensors = () => {
    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <SensorsPage />
        </DashboardLayout>
    )
}

export default Sensors