import { currentUser, currentRole } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { ToastProvider } from '@/components/ui/Toast';
import { CollaboratorLayoutShell } from '@/components/dashboard/collaborator-layout-shell';

export default async function CollaboratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const role = await currentRole();

  // CTV hoặc ADMIN mới được vào khu vực này
  if (!user?.id || (role !== 'COLLABORATOR' && role !== 'ADMIN')) {
    redirect('/dashboard');
  }

  return (
    <ToastProvider>
      <CollaboratorLayoutShell user={user}>
        {children}
      </CollaboratorLayoutShell>
    </ToastProvider>
  );
}
