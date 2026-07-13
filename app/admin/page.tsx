import type { Metadata } from "next";
import { getClubs } from "@/lib/data";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin · Moderation",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const clubs = await getClubs();
  return <AdminDashboard clubs={clubs} />;
}
