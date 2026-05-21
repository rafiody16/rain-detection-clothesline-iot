"use client";

import HistoryPage from "@/views/dashboard/history";
import DashboardLayout from "@/views/dashboard/layout";
import { ReactElement } from "react";

const History = () => {
    return <HistoryPage />;
}

History.getLayout = function getLayout(page: ReactElement) {
    const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "History" },
];
    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            {page}
        </DashboardLayout>
    );
}

export default History;