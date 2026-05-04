import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 md:p-12 text-center text-primary-foreground">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4 text-balance">
            Ready to Join HABSAN ACHIEVERS ACADEMY?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-4 max-w-2xl mx-auto text-pretty">
            Admissions are now open for the 2024/2025 academic session. Give your child the gift of quality education.
          </p>
          <p className="text-sm text-primary-foreground/80 mb-8 max-w-xl mx-auto text-pretty">
            Applying and checking results both require a valid PIN from the school or the PIN shop — no PIN, no access.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/admissions">
                Start Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Link href="/results">Check results</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Link href="/pin-shop">PIN shop</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
