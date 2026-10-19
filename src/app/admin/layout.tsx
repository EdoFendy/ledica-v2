import "@/admin/admin.css";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminShell } from "@/admin/Shell";

export const metadata = { title: "Admin · LE.DI.CA.", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
const count = (q: string) => (db().prepare(q).get() as { n: number }).n;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) return <div className="adm">{children}</div>;
  return <AdminShell user={user} counts={{ leads: count("SELECT COUNT(*) n FROM leads WHERE status='new'"), todo: count("SELECT COUNT(*) n FROM todo WHERE done=0") }}>{children}</AdminShell>;
}
