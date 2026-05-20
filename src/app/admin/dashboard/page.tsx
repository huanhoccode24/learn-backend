import { AdminOverview } from '@/components/dashboard/admin-overview';
import { getAdminStats } from '@/lib/admin';

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-12">
      <AdminOverview stats={stats} />
    </div>
  );
}
