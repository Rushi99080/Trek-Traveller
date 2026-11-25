import Link from "next/link";
import { listEnquiries } from "@/lib/data";
import { enquiryStatuses, PageTitle } from "@/components/admin/ui";
import EnquiryCard from "@/components/admin/EnquiryCard";

export default async function AdminEnquiries({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const all = await listEnquiries();
  const list = status ? all.filter((e) => e.status === status) : all;
  return (
    <>
      <PageTitle title="Enquiries" />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/enquiries" className={`rounded-full px-3 py-1.5 text-sm font-medium ${!status ? "bg-forest-700 text-white" : "bg-white ring-1 ring-mountain-200"}`}>All ({all.length})</Link>
        {enquiryStatuses.map((s) => (
          <Link key={s.key} href={`/admin/enquiries?status=${s.key}`} className={`rounded-full px-3 py-1.5 text-sm font-medium ${status === s.key ? "bg-forest-700 text-white" : "bg-white ring-1 ring-mountain-200"}`}>
            {s.label} ({all.filter((e) => e.status === s.key).length})
          </Link>
        ))}
      </div>
      <ul className="grid gap-3 lg:grid-cols-2">
        {list.map((e) => <EnquiryCard key={e.id} e={e} />)}
        {list.length === 0 && <li className="card p-6 text-mountain-500">No enquiries here.</li>}
      </ul>
    </>
  );
}
