"use client";

import ControlPage from "@/views/dashboard/control";
import DashboardLayout from "@/views/dashboard/layout";

export default function Control() {

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Control Panel" },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <ControlPage/>
    </DashboardLayout>
  );
}