import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home } from "lucide-react"
import Link from "next/link"

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>
}

export default function AdmissionSuccessPage({ searchParams }: PageProps) {
  const refParam = searchParams.ref
  const applicationRef =
    typeof refParam === "string" ? refParam : Array.isArray(refParam) ? refParam[0] : undefined

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                  <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-3xl">Application Submitted Successfully!</CardTitle>
              <CardDescription className="text-base">
                Your admission application has been received and is being processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-muted">
                <h3 className="font-semibold mb-2">Application Reference Number</h3>
                <p className="font-mono text-lg text-primary">{applicationRef ?? "—"}</p>
                {!applicationRef && (
                  <p className="text-xs text-muted-foreground mt-2">
                    If you do not see a reference here, check your browser history or contact admissions with your parent
                    email and child name.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">What Happens Next?</h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground">1.</span>
                    <span>Your application will be reviewed by our admissions team within 3-5 business days</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground">2.</span>
                    <span>You will receive an email confirmation with further instructions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground">3.</span>
                    <span>If approved, you will be invited for an entrance examination</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground">4.</span>
                    <span>Final admission letter will be sent after successful examination</span>
                  </li>
                </ol>
              </div>

              <div className="p-4 rounded-lg border border-border">
                <h3 className="font-semibold mb-2">Important Information</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Keep your reference number safe for future correspondence</li>
                  <li>• Check your email regularly for updates</li>
                  <li>• Contact us if you do not hear back within 7 days</li>
                </ul>
              </div>

              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Homepage
                </Link>
              </Button>

              <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
                <p>Need help? Contact our admissions office:</p>
                <p className="font-medium text-foreground mt-1">admissions@habsan.edu.ng | +234-XXX-XXX-XXXX</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
