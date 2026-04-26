import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PINShop } from "@/components/marketplace/pin-shop"

export const metadata = {
  title: "PIN Shop | Buy Admission & Result PINs",
  description: "Purchase PIN codes to apply for admission or check your exam results",
}

export default function PINShopPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 bg-gradient-to-b from-muted/30 to-background">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-4xl mb-4">PIN Code Shop</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Purchase PIN codes to apply for admission or check your exam results. Secure, instant activation.
            </p>
          </div>
          
          <PINShop />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
