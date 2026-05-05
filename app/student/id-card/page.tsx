import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';
import { fetchMergedPublicSiteContent } from '@/lib/site-content-merge';
import { SITE_CONTENT_KEYS } from '@/lib/site-content-keys';
import { UserIdCard } from '@/components/id-card/user-id-card';

export const dynamic = 'force-dynamic';

export default async function StudentIdCardPage() {
  const current = await getCurrentUser();
  if (!current || current.role !== 'student') redirect('/login');

  const student = await prisma.student.findUnique({
    where: { userId: current.id },
    include: { user: true },
  });
  if (!student) redirect('/login');

  const site = await fetchMergedPublicSiteContent();
  const design = site[SITE_CONTENT_KEYS.idCard];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-bold">My ID Card</h2>
        <p className="text-muted-foreground">Official student identification card.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Student ID card</CardTitle>
        </CardHeader>
        <CardContent>
          <UserIdCard
            design={design}
            fullName={`${student.user.firstName} ${student.user.lastName}`.trim()}
            roleLabel="Student"
            identifier={student.admissionNumber}
            email={student.user.email}
            yearOfEntry={String(student.admissionDate.getFullYear())}
            extraLine={`Class: ${student.classLevel}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
