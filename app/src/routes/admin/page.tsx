import RecentOrdersList from "@/components/admin/dashboard";
import StatComponent from "@/components/admin/dashboard/stat-component";

export default async function AdminPage() {
    return (
        <div>
            <StatComponent />
            <RecentOrdersList />
        </div>
    );
}
