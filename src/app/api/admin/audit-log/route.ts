import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cleanupExpiredAuditLogs } from '@/lib/audit';
import type { AuditLog } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await cleanupExpiredAuditLogs();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const search = searchParams.get('search') || '';
    const action = searchParams.get('action');
    const success = searchParams.get('success');
    const exportCsv = searchParams.get('export') === 'csv';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { actor: { contains: search } },
        { target: { contains: search } },
        { ipAddress: { contains: search } },
      ];
    }
    if (action && action !== 'all') where.action = action;
    if (success === 'true') where.success = true;
    else if (success === 'false') where.success = false;

    if (exportCsv) {
      const allLogs = await prisma.auditLog.findMany({ where, orderBy: { timestamp: 'desc' } });
      const escapeCSV = (v: unknown): string => {
        if (v === null || v === undefined) return '';
        const str = String(v);
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
      };
      const headers = ['ID','Timestamp','Action','Actor','IP Address','Country','Success','Details'];
      const rows = allLogs.map((l: AuditLog) => [escapeCSV(l.id), escapeCSV(l.timestamp.toISOString()), escapeCSV(l.action), escapeCSV(l.actor), escapeCSV(l.ipAddress), escapeCSV(l.country), l.success ? 'Yes' : 'No', escapeCSV(l.details)]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      return new Response(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="audit-log-${new Date().toISOString().split('T')[0]}.csv"` } });
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({ where, orderBy: { timestamp: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({ logs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
