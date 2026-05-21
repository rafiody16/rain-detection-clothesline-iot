import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layouts/app-sidebar";
import { DashboardHeader } from "@/components/layouts/dashboard-header";
import { AddDeviceWizard } from "@/components/custom/add-device-wizard";
import { DeviceGuard } from "@/components/layouts/device-guard";

export default function DashboardLayout({ children, breadcrumbs }: { children: React.ReactNode; breadcrumbs: any[] }) {
    return (
        <SidebarProvider>
            <AddDeviceWizard />
            <AppSidebar />
            <SidebarInset>
                <DashboardHeader breadcrumbs={breadcrumbs} />
                <DeviceGuard>
                    {children}
                </DeviceGuard>
            </SidebarInset>
        </SidebarProvider>
    );
}