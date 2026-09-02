import JobDetail from "@/components/technician/job-detail";

export default async function TechnicianJobPage({
  params,
}: PageProps<"/technician/jobs/[reference]">) {
  const { reference } = await params;
  return <JobDetail reference={reference} />;
}
