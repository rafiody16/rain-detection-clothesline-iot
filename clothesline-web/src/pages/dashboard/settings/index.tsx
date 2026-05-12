import DashboardLayout from "@/components/dashboard/layout";
import SettingsPage from "@/components/dashboard/settings";

const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Configuration" },
];

const Settings = () => {
    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <SettingsPage />
        </DashboardLayout>
    )
}

export default Settings
