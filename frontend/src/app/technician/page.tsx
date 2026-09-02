import { getCurrentUser } from "@/lib/server/current-user";
import TechnicianPortal from "@/components/technician/technician-portal";

export default async function TechnicianPage() {
  const user = await getCurrentUser();
  return <TechnicianPortal engineerName={user?.name ?? "Engineer"} />;
}
