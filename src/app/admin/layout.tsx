export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/40">
      {/* A simple placeholder for admin navigation could go here */}
      <nav className="bg-background border-b p-4">
        <h1 className="text-xl font-bold text-primary">FinTrack AI - Admin Panel</h1>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
