import { ReactElement } from "react";
import DashboardLayout from "@/views/dashboard/layout";
import SensorsPage from "@/views/dashboard/sensors";

const Sensors = () => {
  return <SensorsPage />;
};

Sensors.getLayout = function getLayout(page: ReactElement) {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Sensors" },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      {page}
    </DashboardLayout>
  );
};

export default Sensors;