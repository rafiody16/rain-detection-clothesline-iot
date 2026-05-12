import DashboardLayout from "@/views/dashboard/layout";
import SettingsPage from "@/pages/dashboard/settings";

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
