import { LayoutDashboard, Settings, Shield, FileText } from 'lucide-react';
import Link from 'next/link';

const quickLinks = [
  { label: 'Setup', description: 'API keys & integrations', href: '/admin/setup', icon: Settings },
  { label: 'Security', description: 'Password & 2FA', href: '/admin/security', icon: Shield },
  { label: 'Audit Log', description: 'Security events', href: '/admin/audit-log', icon: FileText },
];

export default function AdminDashboard() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="h-6 w-6 text-[#2E2865]" />
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}
              className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <Icon className="h-6 w-6 text-[#2E2865]" />
              </div>
              <h3 className="font-semibold text-gray-900">{link.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{link.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
