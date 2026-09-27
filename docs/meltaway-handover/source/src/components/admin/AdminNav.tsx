'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Settings,
  Users,
  LogOut,
  Shield,
  LayoutDashboard,
  Menu,
  X,
  MessageSquare,
  FileText,
  Search,
  BarChart3,
  Bot,
  Lock,
  ChevronLeft,
  ChevronRight,
  Camera,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface AdminNavProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/patients', label: 'Patients', icon: Users },
  { href: '/admin/sms-consents', label: 'SMS Consents', icon: MessageSquare },
  { href: '/admin/simulator', label: 'Simulator', icon: Camera },
  { href: '/admin/audit-log', label: 'Audit Log', icon: FileText },
  { href: '/admin/seo', label: 'SEO', icon: Search },
  { href: '/admin/robots', label: 'Robots.txt', icon: Bot },
  { href: '/admin/tracking', label: 'Tracking', icon: BarChart3 },
  { href: '/admin/access-control', label: 'Access Control', icon: Lock },
  { href: '/admin/setup', label: 'Setup', icon: Settings },
  { href: '/admin/security', label: 'Security', icon: Shield },
];

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/log-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'logout' }),
      });
    } catch {
      // Continue with sign out even if logging fails
    }
    signOut({ callbackUrl: '/admin/login' });
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-white border-r border-[var(--color-border)] transition-all duration-300 z-40 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--color-border)]">
          <Link href="/admin" className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-semibold text-[var(--color-text)] whitespace-nowrap">
                Admin
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-[var(--color-border)] p-4">
          {!collapsed ? (
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-medium text-[var(--color-text)] truncate">
                  {user.name || 'Admin'}
                </p>
                <p className="text-[var(--color-text-muted)] text-xs truncate">
                  {user.email}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleSignOut}
                leftIcon={<LogOut className="h-4 w-4" />}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="w-full flex items-center justify-center p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[var(--color-border)] z-40">
        <div className="flex items-center justify-between h-full px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-[var(--color-text)]">Admin</span>
          </Link>
          <button
            className="p-2 text-[var(--color-text-muted)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-screen w-72 bg-white border-r border-[var(--color-border)] z-50 transform transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--color-border)]">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-[var(--color-text)]">Admin</span>
          </Link>
          <button
            className="p-2 text-[var(--color-text-muted)]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    active
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[var(--color-border)] p-4">
          <div className="space-y-3">
            <div className="text-sm">
              <p className="font-medium text-[var(--color-text)]">{user.name || 'Admin'}</p>
              <p className="text-[var(--color-text-muted)] text-xs">{user.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleSignOut}
              leftIcon={<LogOut className="h-4 w-4" />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
