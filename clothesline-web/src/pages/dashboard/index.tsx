import { ReactElement } from "react";
import Dashboard from "../../views/dashboard";
import DashboardLayout from "../../views/dashboard/layout";

const Homepage = () => {
    return <Dashboard />;
};

Homepage.getLayout = function getLayout(page: ReactElement) {
    const breadcrumbs = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Smart Clothesline" },
    ];

    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            {page}
        </DashboardLayout>
    );
};

export default Homepage;