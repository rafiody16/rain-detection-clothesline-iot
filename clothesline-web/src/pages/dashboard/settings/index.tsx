import { ReactElement } from "react";
import DashboardLayout from "@/views/dashboard/layout";
import SettingsPage from "@/pages/dashboard/settings";

const Settings = () => {
  return <SettingsPage />;
};

Settings.getLayout = function getLayout(page: ReactElement) {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Configuration" },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      {page}
    </DashboardLayout>
  );
};

export default Settings;
