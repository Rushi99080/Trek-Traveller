import { getLeaders } from "@/lib/data";
import { PageTitle } from "@/components/admin/ui";
import LeadersEditor from "@/components/admin/LeadersEditor";

export default async function AdminLeaders() {
  const leaders = await getLeaders();
  return (
    <>
      <PageTitle title="Trek leaders" />
      <p className="-mt-3 mb-5 text-mountain-600">Leaders appear on trip pages and the About page. Assign them to batches from each trip&apos;s Batches section.</p>
      <LeadersEditor leaders={leaders} />
    </>
  );
}
