import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { GalleryPublic } from '@/components/gallery/gallery-public';

export default function GalleryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-r from-primary to-primary/80 py-16 text-primary-foreground md:py-24">
          <div className="container">
            <h1 className="mb-4 text-balance font-heading text-4xl font-bold md:text-5xl">School Gallery</h1>
            <p className="max-w-2xl text-pretty text-lg text-primary-foreground/90">
              Explore moments of learning, growth, and achievement at HABSAN ACHIEVERS ACADEMY
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container">
            <GalleryPublic />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
