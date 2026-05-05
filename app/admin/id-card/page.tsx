import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';
import { fetchMergedPublicSiteContent } from '@/lib/site-content-merge';
import { SITE_CONTENT_KEYS } from '@/lib/site-content-keys';
import { UserIdCard } from '@/components/id-card/user-id-card';

export const dynamic = 'force-dynamic';

export default async function AdminIdCardPage() {
  const current = await getCurrentUser();
  if (!current || current.role !== 'admin') redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: current.id },
    select: { createdAt: true, firstName: true, lastName: true, email: true },
  });
  if (!user) redirect('/login');

  const site = await fetchMergedPublicSiteContent();
  const design = site[SITE_CONTENT_KEYS.idCard];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-bold">My ID Card</h2>
        <p className="text-muted-foreground">Official staff/admin identification card.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Admin ID card</CardTitle>
        </CardHeader>
        <CardContent>
          <UserIdCard
            design={design}
            fullName={`${user.firstName} ${user.lastName}`.trim()}
            roleLabel="Admin"
            identifier={`ADM-${current.id.slice(0, 8).toUpperCase()}`}
            email={user.email}
            yearOfEntry={String(user.createdAt.getFullYear())}
            extraLine="System Administrator"
          />
        </CardContent>
      </Card>
    </div>
  );
}
