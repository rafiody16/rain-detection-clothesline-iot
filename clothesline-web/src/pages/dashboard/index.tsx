import Dashboard from "../../views/dashboard";
import DashboardLayout from "../../views/dashboard/layout";

const Homepage = () => {
    const breadcrumbs = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Smart Clothesline" },
    ];

    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <Dashboard />
        </DashboardLayout>
    );
};

export default Homepage;