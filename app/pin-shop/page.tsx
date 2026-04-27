import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AlertTriangle } from "lucide-react"

export const metadata = {
  title: "PIN Codes | Admin Issued",
  description: "PIN shop is disabled; get PIN codes from school administration",
}

export default function PINShopPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 bg-gradient-to-b from-muted/30 to-background">
        <div className="container max-w-4xl">
          <div className="text-center mb-12 rounded-xl border border-amber-300 bg-amber-50 p-8">
            <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-amber-700" />
            <h1 className="font-heading font-bold text-4xl mb-4 text-amber-900">PIN Shop Disabled</h1>
            <p className="text-amber-900/80 text-lg max-w-2xl mx-auto">
              PIN codes are now issued only by school administration. Visit the office or approved sales channel to get
              your Admission or Result PIN.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
