import { NavSidebar } from "@/components/nav-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavSidebar />
      <div className="md:pl-64 pt-16 md:pt-0">
        <main className="p-6">{children}</main>
      </div>
    </>
  );
}
