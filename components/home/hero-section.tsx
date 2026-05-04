'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { SITE_CONTENT_KEYS } from '@/lib/site-content-keys';
import { getDefaultPublicSiteContent, type HeroSlide } from '@/lib/site-content-defaults';

const FALLBACK_SLIDES = getDefaultPublicSiteContent()[SITE_CONTENT_KEYS.hero].slides;

export function HeroSection() {
  const [slides, setSlides] = useState<HeroSlide[]>(FALLBACK_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/public/site-content', { cache: 'no-store' });
        if (!res.ok) return;
        const json = (await res.json()) as Record<string, unknown>;
        const key = SITE_CONTENT_KEYS.hero;
        const block = json[key] as { slides?: HeroSlide[] } | undefined;
        const next = block?.slides;
        if (!cancelled && Array.isArray(next) && next.length > 0) {
          setSlides(next);
          setCurrentSlide(0);
        }
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const len = slides.length;
  const safeIndex = len > 0 ? currentSlide % len : 0;

  useEffect(() => {
    if (len === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % len);
    }, 5000);
    return () => clearInterval(timer);
  }, [len]);

  const nextSlide = () => len && setCurrentSlide((prev) => (prev + 1) % len);
  const prevSlide = () => len && setCurrentSlide((prev) => (prev - 1 + len) % len);

  if (len === 0) return null;

  return (
    <section className="relative h-[600px] overflow-hidden bg-muted">
      {slides.map((s, index) => (
        <div
          key={`${s.title}-${index}`}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === safeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img src={s.image || '/placeholder.svg'} alt={s.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
          <div className="absolute inset-0 flex items-center">
            <div className="container">
              <div className="max-w-2xl text-primary-foreground">
                <h1 className="mb-4 text-balance font-heading text-4xl font-bold md:text-5xl lg:text-6xl">{s.title}</h1>
                <p className="mb-8 text-pretty text-lg text-primary-foreground/90 md:text-xl">{s.subtitle}</p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/admissions">Apply Now</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    <Link href="/about">Learn More</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-primary-foreground/20 backdrop-blur-sm transition-colors hover:bg-primary-foreground/30"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 text-primary-foreground" />
      </button>
      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-primary-foreground/20 backdrop-blur-sm transition-colors hover:bg-primary-foreground/30"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 text-primary-foreground" />
      </button>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === safeIndex ? 'w-8 bg-primary-foreground' : 'w-2 bg-primary-foreground/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
