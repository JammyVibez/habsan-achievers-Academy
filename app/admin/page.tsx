import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, BookOpen, DollarSign, Bell } from 'lucide-react';
import { getAdminDashboardSnapshot } from '@/lib/admin-data';

export const dynamic = 'force-dynamic';

function formatNgn(n: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function AdminDashboardPage() {
  let snapshot: Awaited<ReturnType<typeof getAdminDashboardSnapshot>>;
  try {
    snapshot = await getAdminDashboardSnapshot();
  } catch {
    return (
      <div className="space-y-4 rounded-lg border border-destructive/50 bg-destructive/5 p-6">
        <h2 className="font-heading text-xl font-semibold">Dashboard unavailable</h2>
        <p className="text-muted-foreground">
          Could not load dashboard data. Check that the database is reachable and environment variables are set.
        </p>
      </div>
    );
  }

  const {
    studentCount,
    teacherCount,
    subjectCount,
    revenueThisMonth,
    newStudentsThisMonth,
    newTeachersThisMonth,
    activities,
  } = snapshot;

  const stats = [
    {
      title: 'Total Students',
      value: String(studentCount),
      change: `${newStudentsThisMonth} new this month`,
      icon: GraduationCap,
      trend: newStudentsThisMonth > 0 ? ('up' as const) : ('neutral' as const),
    },
    {
      title: 'Total Teachers',
      value: String(teacherCount),
      change: `${newTeachersThisMonth} new this month`,
      icon: Users,
      trend: newTeachersThisMonth > 0 ? ('up' as const) : ('neutral' as const),
    },
    {
      title: 'Active Subjects',
      value: String(subjectCount),
      change: 'From your catalog',
      icon: BookOpen,
      trend: 'neutral' as const,
    },
    {
      title: 'Revenue (This Month)',
      value: formatNgn(revenueThisMonth),
      change: 'Paid PIN orders',
      icon: DollarSign,
      trend: revenueThisMonth > 0 ? ('up' as const) : ('neutral' as const),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 font-heading text-3xl font-bold">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your school today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-1 font-heading text-2xl font-bold">{stat.value}</div>
              <p
                className={`text-xs ${
                  stat.trend === 'up'
                    ? 'text-green-600'
                    : stat.trend === 'down'
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                }`}
              >
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent admissions or user sign-ups yet.</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div
                    key={`${activity.type}-${index}`}
                    className="flex items-center gap-3 border-b border-border pb-3 last:border-0"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                      <Bell className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                <Link href="/admin/students">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">Add Student</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                <Link href="/admin/teachers">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">Add Teacher</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                <Link href="/admin/results">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">Upload Results</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                <Link href="/admin/noticeboard">
                  <Bell className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">Post Notice</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
