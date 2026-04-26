import { Card, CardContent } from "@/components/ui/card"
import { Calendar, DollarSign, FileText, Users } from "lucide-react"

export function AdmissionInfo() {
  const requirements = [
    "Birth certificate or age declaration",
    "Previous school report card (if applicable)",
    "Two recent passport photographs",
    "Parent/Guardian valid ID card",
    "Proof of residence",
    "Medical fitness certificate",
  ]

  const fees = [
    { level: "Pre-Nursery - Nursery 2", amount: "₦150,000" },
    { level: "Primary 1 - Primary 6", amount: "₦200,000" },
    { level: "JSS 1 - JSS 3", amount: "₦250,000" },
    { level: "SS 1 - SS 3", amount: "₦300,000" },
  ]

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
                * Fees are per academic session and subject to review
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
                <li>Application Opens: January 2, 2025</li>
                <li>Application Closes: August 31, 2025</li>
                <li>Entrance Exam: September 5-7, 2025</li>
                <li>Resumption Date: September 15, 2025</li>
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
                <li>Phone: +234-XXX-XXX-XXXX</li>
                <li>Email: admissions@habsan.edu.ng</li>
                <li>Office Hours: Mon-Fri, 8:00 AM - 4:00 PM</li>
                <li>Location: Plot 123, Education Avenue, Abuja</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
