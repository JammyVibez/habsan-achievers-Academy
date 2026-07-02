import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, Users } from 'lucide-react';
import { listPublishedNotices } from '@/lib/notices';

function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'urgent':
      return <Badge className="bg-destructive">Urgent</Badge>;
    case 'high':
      return <Badge className="bg-orange-500">High Priority</Badge>;
    case 'medium':
      return <Badge className="bg-blue-500">Medium</Badge>;
    default:
      return <Badge variant="secondary">Low</Badge>;
  }
}

export default async function NoticeboardPage() {
  const notices = await listPublishedNotices();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="font-heading font-bold text-4xl mb-4">Noticeboard</h1>
            <p className="text-muted-foreground text-lg">Stay updated with school announcements and news</p>
          </div>

          {notices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No announcements at the moment. Check back soon.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {notices.map((notice) => (
                <Card key={notice.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mt-1 shrink-0">
                          <Bell className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="mb-2">{notice.title}</CardTitle>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(notice.publishedAt ?? notice.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {notice.targetAudience.charAt(0).toUpperCase() + notice.targetAudience.slice(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                      {getPriorityBadge(notice.priority)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{notice.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
