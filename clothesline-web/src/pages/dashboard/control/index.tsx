import { ReactElement } from "react";
import ControlPage from "@/views/dashboard/control";
import DashboardLayout from "@/views/dashboard/layout";

const Control = () => {
  return <ControlPage />;
};

Control.getLayout = function getLayout(page: ReactElement) {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Control Panel" },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      {page}
    </DashboardLayout>
  );
};

export default Control;