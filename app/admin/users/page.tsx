import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { getAdminUsersPageData } from '@/lib/admin-data';
import { AdminUsersTable } from '@/components/admin/admin-users-table';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  let data: Awaited<ReturnType<typeof getAdminUsersPageData>>;
  try {
    data = await getAdminUsersPageData();
  } catch {
    return (
      <div className="space-y-4 rounded-lg border border-destructive/50 bg-destructive/5 p-6">
        <h1 className="font-heading text-xl font-semibold">Users unavailable</h1>
        <p className="text-muted-foreground">Could not load users from the database.</p>
      </div>
    );
  }

  const { users, totalUsers, activeUsers, newThisMonth, inactiveUsers } = data;
  const activeRate = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : '0';

  const usersForTable = users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
  }));

  const stats = [
    { label: 'Total Users', value: String(totalUsers), change: 'All roles' },
    { label: 'Active Users', value: String(activeUsers), change: `${activeRate}% active rate` },
    { label: 'New This Month', value: String(newThisMonth), change: 'Created this calendar month' },
    { label: 'Inactive', value: String(inactiveUsers), change: 'Suspended / deactivated' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage all system users and their permissions</p>
        </div>
        <Button type="button" disabled>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>All Users</CardTitle>
            <CardDescription>View and manage user accounts (live data)</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <AdminUsersTable users={usersForTable} />
        </CardContent>
      </Card>
    </div>
  );
}
