import { MainNav } from "@/components/MainNav";
import { Providers } from "@/components/Providers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <Providers>
      <div className="min-h-screen bg-bg flex flex-col">
        <MainNav user={session.user} />
        <main className="flex-1 flex">{children}</main>
      </div>
    </Providers>
  );
}
