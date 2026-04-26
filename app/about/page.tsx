import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Eye, Award, Users } from 'lucide-react';
import { fetchMergedPublicSiteContent } from '@/lib/site-content-merge';
import { SITE_CONTENT_KEYS } from '@/lib/site-content-keys';
import { getDefaultPublicSiteContent } from '@/lib/site-content-defaults';

export default async function AboutPage() {
  let about = getDefaultPublicSiteContent()[SITE_CONTENT_KEYS.about];
  let coreValues = getDefaultPublicSiteContent()[SITE_CONTENT_KEYS.coreValues];
  try {
    const site = await fetchMergedPublicSiteContent();
    about = site[SITE_CONTENT_KEYS.about];
    coreValues = site[SITE_CONTENT_KEYS.coreValues];
  } catch {
    /* defaults */
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary py-12 text-primary-foreground">
          <div className="container">
            <h1 className="mb-4 font-heading text-4xl font-bold md:text-5xl">About Us</h1>
            <p className="max-w-3xl text-lg text-primary-foreground/90">
              Learn more about HABSAN ACHIEVERS ACADEMY and our commitment to excellence in education
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="mb-4 font-heading text-3xl font-bold md:text-4xl">Who We Are</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">{about.content}</p>
            </div>

            <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="mb-2 font-heading text-xl font-semibold">Our Mission</h3>
                      <p className="leading-relaxed text-muted-foreground">{about.mission}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Eye className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="mb-2 font-heading text-xl font-semibold">Our Vision</h3>
                      <p className="leading-relaxed text-muted-foreground">{about.vision}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-16">
              <h2 className="mb-8 text-center font-heading text-3xl font-bold">{coreValues.sectionTitle}</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {coreValues.items.map((value, index) => (
                  <Card key={`${value.title}-${index}`}>
                    <CardContent className="pt-6 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Award className="h-6 w-6" />
                      </div>
                      <h3 className="mb-2 font-heading text-lg font-semibold">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-heading text-xl font-semibold">{about.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">
                      HABSAN ACHIEVERS ACADEMY is more than just a school — it&apos;s a community of learners, educators,
                      and families working together to nurture the next generation of leaders.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
