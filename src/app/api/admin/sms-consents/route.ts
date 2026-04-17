import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { SmsConsent } from '@/generated/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type');
    const consented = searchParams.get('consented');
    const exportCsv = searchParams.get('export') === 'csv';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { phone: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }
    if (type === 'transactional' || type === 'marketing') where.consentType = type;
    if (consented === 'true') where.consented = true;
    else if (consented === 'false') where.consented = false;

    if (exportCsv) {
      const allConsents = await prisma.smsConsent.findMany({ where, orderBy: { createdAt: 'desc' } });
      const escapeCSV = (v: unknown): string => {
        if (v === null || v === undefined) return '';
        const str = String(v);
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
      };
      const headers = ['ID','Timestamp','First Name','Last Name','Email','Phone','Consent Type','Consented','Source','IP Address','Consent Text'];
      const rows = allConsents.map((c: SmsConsent) => [escapeCSV(c.id), escapeCSV(c.createdAt.toISOString()), escapeCSV(c.firstName), escapeCSV(c.lastName), escapeCSV(c.email), escapeCSV(c.phone), escapeCSV(c.consentType), c.consented ? 'Yes' : 'No', escapeCSV(c.source), escapeCSV(c.ipAddress), escapeCSV(c.consentText)]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      return new Response(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="sms-consents-${new Date().toISOString().split('T')[0]}.csv"` } });
    }

    const [consents, total] = await Promise.all([
      prisma.smsConsent.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.smsConsent.count({ where }),
    ]);

    return NextResponse.json({ consents, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    console.error('Failed to fetch SMS consents:', error);
    return NextResponse.json({ error: 'Failed to fetch SMS consents' }, { status: 500 });
  }
}
