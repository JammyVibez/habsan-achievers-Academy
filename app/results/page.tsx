import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AdvancedResultChecker } from "@/components/results/advanced-result-checker"

export default function ResultsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="font-heading font-bold text-4xl mb-4">Check Your Results</h1>
            <p className="text-muted-foreground text-lg">
              Enter your admission number and PIN to view your academic results and download your report card
            </p>
          </div>
          <AdvancedResultChecker />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
