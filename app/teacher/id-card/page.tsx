import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';
import { fetchMergedPublicSiteContent } from '@/lib/site-content-merge';
import { SITE_CONTENT_KEYS } from '@/lib/site-content-keys';
import { UserIdCard } from '@/components/id-card/user-id-card';

export const dynamic = 'force-dynamic';

export default async function TeacherIdCardPage() {
  const current = await getCurrentUser();
  if (!current || current.role !== 'teacher') redirect('/login');

  const teacher = await prisma.teacher.findUnique({
    where: { userId: current.id },
    include: { user: true },
  });
  if (!teacher) redirect('/login');

  const site = await fetchMergedPublicSiteContent();
  const design = site[SITE_CONTENT_KEYS.idCard];
  const subjects = await prisma.teacherSubject.findMany({
    where: { teacherId: teacher.id },
    include: { subject: { select: { name: true } } },
  });
  const firstSubject = subjects[0]?.subject.name ?? 'General';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-bold">My ID Card</h2>
        <p className="text-muted-foreground">Official teacher identification card.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Teacher ID card</CardTitle>
        </CardHeader>
        <CardContent>
          <UserIdCard
            design={design}
            fullName={`${teacher.user.firstName} ${teacher.user.lastName}`.trim()}
            roleLabel="Teacher"
            identifier={teacher.staffId}
            email={teacher.user.email}
            yearOfEntry={String(teacher.dateOfJoining.getFullYear())}
            extraLine={`Primary Subject: ${firstSubject}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
