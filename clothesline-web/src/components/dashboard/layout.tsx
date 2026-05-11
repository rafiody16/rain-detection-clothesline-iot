import { MqttProvider } from "@/contexts/mqtt-context";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "../app-sidebar";
import { DashboardHeader } from "../dashboard-header";
export default function DashboardLayout({ children, breadcrumbs }: { children: React.ReactNode; breadcrumbs: any[] }) {
    return (
        <MqttProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <DashboardHeader breadcrumbs={breadcrumbs} />
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </MqttProvider>

    );
}