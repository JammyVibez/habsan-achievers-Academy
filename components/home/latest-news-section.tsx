import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, Bell } from 'lucide-react';
import Link from 'next/link';
import { listPublishedNotices } from '@/lib/notices';

export async function LatestNewsSection() {
  const notices = await listPublishedNotices(3);

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-2 text-balance">Latest News & Updates</h2>
            <p className="text-muted-foreground text-lg text-pretty">
              Stay informed about what&apos;s happening at our school
            </p>
          </div>
          <Button asChild variant="outline" className="hidden md:inline-flex bg-transparent">
            <Link href="/noticeboard">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {notices.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No announcements yet. Visit the noticeboard for updates.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {notices.map((notice) => (
              <Card key={notice.id} className="overflow-hidden border-border hover:border-primary/50 transition-colors">
                <div className="aspect-video overflow-hidden bg-primary/5 flex items-center justify-center">
                  <Bell className="h-12 w-12 text-primary/40" />
                </div>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(notice.publishedAt ?? notice.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2 line-clamp-2">{notice.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">{notice.content}</p>
                  <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/noticeboard">
                      Read More
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline">
            <Link href="/noticeboard">
              View All News
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
