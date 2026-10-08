import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import KasirNavbar from "@/components/KasirNavbar";

export default async function KasirLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen">
      <KasirNavbar name={session.user.name ?? session.user.username} role={session.user.role} />
      <main className="cashier-main mx-auto max-w-[1600px] px-4 pb-28 pt-6 sm:px-6 sm:pb-28 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
