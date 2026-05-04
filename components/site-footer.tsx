import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { fetchMergedPublicSiteContent } from '@/lib/site-content-merge';
import { SITE_CONTENT_KEYS } from '@/lib/site-content-keys';
import { getDefaultPublicSiteContent } from '@/lib/site-content-defaults';

export async function SiteFooter() {
  let contact = getDefaultPublicSiteContent()[SITE_CONTENT_KEYS.contact];
  try {
    const site = await fetchMergedPublicSiteContent();
    contact = site[SITE_CONTENT_KEYS.contact];
  } catch {
    /* defaults */
  }

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
                HAA
              </div>
              <div>
                <div className="font-heading text-sm font-bold leading-tight">HABSAN ACHIEVERS</div>
                <div className="text-xs text-muted-foreground">ACADEMY</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Nurturing excellence and building future leaders through quality education from Pre-Nursery to Secondary
              School.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-heading font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground transition-colors hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/admissions" className="text-muted-foreground transition-colors hover:text-primary">
                  Admissions
                </Link>
              </li>
              <li>
                <Link href="/results" className="text-muted-foreground transition-colors hover:text-primary">
                  Check Results
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-muted-foreground transition-colors hover:text-primary">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-muted-foreground transition-colors hover:text-primary">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/noticeboard" className="text-muted-foreground transition-colors hover:text-primary">
                  Noticeboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-heading font-semibold">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span className="whitespace-pre-line text-muted-foreground">{contact.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-muted-foreground">{contact.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-muted-foreground">{contact.email}</span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">{contact.office_hours}</p>
          </div>

          <div>
            <h3 className="mb-4 font-heading font-semibold">Follow Us</h3>
            <div className="flex gap-3">
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Facebook className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Instagram className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Stay connected with us for updates, news, and announcements.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
            <p>&copy; {new Date().getFullYear()} HABSAN ACHIEVERS ACADEMY. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="transition-colors hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-primary">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
