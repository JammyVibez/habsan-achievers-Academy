import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AdmissionInfo } from "@/components/admissions/admission-info"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function AdmissionsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container">
            <div className="max-w-3xl">
              <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">Admissions 2024/2025</h1>
              <p className="text-lg text-primary-foreground/90 mb-6">
                Join HABSAN ACHIEVERS ACADEMY and give your child the gift of quality education. Applications are now
                open for the 2024/2025 academic session.
              </p>
              <Button asChild size="lg" variant="secondary">
                <Link href="/admissions/apply">
                  Start Application
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">Admission Process</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Follow these simple steps to complete your admission application
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">1. Get Admission PIN</h3>
                <p className="text-muted-foreground">
                  Purchase an admission PIN code from the school or authorized vendors
                </p>
              </div>

              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">2. Fill Application Form</h3>
                <p className="text-muted-foreground">Complete the online application form with accurate information</p>
              </div>

              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">3. Submit & Wait</h3>
                <p className="text-muted-foreground">Submit your application and wait for admission confirmation</p>
              </div>
            </div>
          </div>
        </section>

        <AdmissionInfo />

        <section className="py-16 bg-muted/30">
          <div className="container text-center">
            <h2 className="font-heading font-bold text-3xl mb-4">Ready to Apply?</h2>
            <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
              Start your admission application now and join our community of learners
            </p>
            <Button asChild size="lg">
              <Link href="/admissions/apply">
                Begin Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
