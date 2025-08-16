import { db } from '@/lib/db/db';
import { suspiciousRequests } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

type SuspiciousRequest = typeof suspiciousRequests.$inferSelect;

export default async function SuspiciousRequestsPage() {
  const rows: SuspiciousRequest[] = await db.select().from(suspiciousRequests).orderBy(desc(suspiciousRequests.createdAt)).limit(200);
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Suspicious Requests (latest 200)</h1>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Time</th>
            <th className="p-2 text-left">IP</th>
            <th className="p-2 text-left">Path</th>
            <th className="p-2 text-left">Method</th>
            <th className="p-2 text-left">Reason</th>
            <th className="p-2 text-left">User Agent</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-t hover:bg-gray-50">
              <td className="p-2 whitespace-nowrap">{r.createdAt?.toISOString?.() || ''}</td>
              <td className="p-2">{r.ipAddress}</td>
              <td className="p-2 break-all max-w-[200px]">{r.path}</td>
              <td className="p-2">{r.method}</td>
              <td className="p-2">{r.reason}</td>
              <td className="p-2 truncate max-w-[250px]" title={r.userAgent || ''}>{r.userAgent}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td className="p-4 text-center" colSpan={6}>No suspicious requests logged.</td></tr>
          )}
        </tbody>
      </table>
      <p className="text-xs text-gray-500">Retention policy may prune older entries automatically.</p>
    </div>
  );
}
