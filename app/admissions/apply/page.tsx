import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AdmissionForm } from "@/components/admissions/admission-form"

export default function ApplyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="font-heading font-bold text-4xl mb-4">Admission Application</h1>
            <p className="text-muted-foreground text-lg">
              Complete the form below to apply for admission to HABSAN ACHIEVERS ACADEMY
            </p>
          </div>
          <AdmissionForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
