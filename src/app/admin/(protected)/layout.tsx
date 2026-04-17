import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/admin/AdminNav';

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');
  if (session.user.role !== 'admin') redirect('/admin/login?error=unauthorized');

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav user={session.user} />
      <main className="lg:ml-64 pt-0 lg:pt-0">
        <div className="lg:hidden h-16" />
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
