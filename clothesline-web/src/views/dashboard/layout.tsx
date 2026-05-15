import { MqttProvider } from "@/contexts/mqtt-context";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layouts/app-sidebar";
import { DashboardHeader } from "@/components/layouts/dashboard-header";
import { FirebaseProvider } from "@/contexts/firebase-context";
export default function DashboardLayout({ children, breadcrumbs }: { children: React.ReactNode; breadcrumbs: any[] }) {
    return (
        <FirebaseProvider>
        <MqttProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <DashboardHeader breadcrumbs={breadcrumbs} />
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </MqttProvider>
        </FirebaseProvider>

    );
}