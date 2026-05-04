"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            HAA
          </div>
          <div className="hidden sm:block">
            <div className="font-heading font-bold text-lg leading-tight">HABSAN ACHIEVERS</div>
            <div className="text-xs text-muted-foreground">ACADEMY</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
            About Us
          </Link>
          <Link href="/our-story" className="text-sm font-medium hover:text-primary transition-colors">
            Our Story
          </Link>
          <Link href="/gallery" className="text-sm font-medium hover:text-primary transition-colors">
            Gallery
          </Link>
          <Link href="/e-learning" className="text-sm font-medium hover:text-primary transition-colors">
            E-Learning
          </Link>
          <Link href="/admissions" className="text-sm font-medium hover:text-primary transition-colors">
            Admissions
          </Link>
          <Link href="/results" className="text-sm font-medium hover:text-primary transition-colors">
            Check Results
          </Link>
          <Link href="/marketplace" className="text-sm font-medium hover:text-primary transition-colors">
            Marketplace
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link href="/admissions">Apply Now</Link>
          </Button>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <nav className="container flex flex-col gap-4 py-4">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About Us
            </Link>
            <Link href="/our-story" className="text-sm font-medium hover:text-primary transition-colors">
              Our Story
            </Link>
            <Link href="/gallery" className="text-sm font-medium hover:text-primary transition-colors">
              Gallery
            </Link>
            <Link href="/e-learning" className="text-sm font-medium hover:text-primary transition-colors">
              E-Learning
            </Link>
            <Link href="/admissions" className="text-sm font-medium hover:text-primary transition-colors">
              Admissions
            </Link>
            <Link href="/results" className="text-sm font-medium hover:text-primary transition-colors">
              Check Results
            </Link>
            <Link href="/marketplace" className="text-sm font-medium hover:text-primary transition-colors">
              Marketplace
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link>
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/admissions">Apply Now</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
