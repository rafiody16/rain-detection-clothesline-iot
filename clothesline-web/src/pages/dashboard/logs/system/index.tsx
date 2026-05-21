import { ReactElement } from "react";
import SystemLogsPage from "@/views/dashboard/logs/system";
import DashboardLayout from "@/views/dashboard/layout";

const SystemLogs = () => {
  return <SystemLogsPage />;
};

SystemLogs.getLayout = function getLayout(page: ReactElement) {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "System Logs" },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      {page}
    </DashboardLayout>
  );
};

export default SystemLogs;