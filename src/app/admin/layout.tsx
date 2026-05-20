import { currentUser, isAdmin } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { ToastProvider } from '@/components/ui/Toast';
import { AdminLayoutShell } from '@/components/dashboard/admin-layout-shell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const isUserAdmin = await isAdmin();

  if (!isUserAdmin || !user?.id) {
    redirect('/dashboard');
  }

  return (
    <ToastProvider>
      <AdminLayoutShell user={user}>
        {children}
      </AdminLayoutShell>
    </ToastProvider>
  );
}
