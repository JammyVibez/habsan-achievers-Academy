import { Card, CardContent } from "@/components/ui/card"
import { Calendar, DollarSign, FileText, Users } from "lucide-react"
import { fetchMergedPublicSiteContent } from "@/lib/site-content-merge"
import { SITE_CONTENT_KEYS } from "@/lib/site-content-keys"

export async function AdmissionInfo() {
  const siteContent = await fetchMergedPublicSiteContent()
  const admissionContent = siteContent[SITE_CONTENT_KEYS.admissions]
  const requirements = [
    "Birth certificate or age declaration",
    "Previous school report card (if applicable)",
    "Two recent passport photographs",
    "Parent/Guardian valid ID card",
    "Proof of residence",
    "Medical fitness certificate",
  ]

  const fees = admissionContent.fees

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-semibold text-2xl">Admission Requirements</h3>
              </div>
              <ul className="space-y-3">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-semibold text-2xl">School Fees Structure</h3>
              </div>
              <div className="space-y-3">
                {fees.map((fee, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <span className="font-medium">{fee.level}</span>
                    <span className="font-semibold text-primary">{fee.amount}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {admissionContent.feesNote}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-5 w-5 text-primary" />
                <h4 className="font-heading font-semibold text-lg">Important Dates</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {admissionContent.importantDates.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-5 w-5 text-primary" />
                <h4 className="font-heading font-semibold text-lg">Contact Admissions Office</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {admissionContent.admissionsOffice.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
