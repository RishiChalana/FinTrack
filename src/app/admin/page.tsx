import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Overview</h2>
      <Card>
        <CardHeader>
          <CardTitle>System Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>User management, system health, and app-wide analytics will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
