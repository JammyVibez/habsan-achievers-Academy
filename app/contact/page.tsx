import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { fetchMergedPublicSiteContent } from "@/lib/site-content-merge"
import { SITE_CONTENT_KEYS } from "@/lib/site-content-keys"

export default async function ContactPage() {
  const siteContent = await fetchMergedPublicSiteContent()
  const contact = siteContent[SITE_CONTENT_KEYS.contact]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container">
            <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">Contact Us</h1>
            <p className="text-lg text-primary-foreground/90">Get in touch with us for any inquiries or information</p>
          </div>
        </section>

        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="font-heading font-bold text-3xl mb-6">Send us a Message</h2>
                <Card>
                  <CardContent className="pt-6">
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input id="firstName" placeholder="John" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input id="lastName" placeholder="Doe" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="john.doe@example.com" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="+234-XXX-XXX-XXXX" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="How can we help you?" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" placeholder="Your message..." rows={5} required />
                      </div>

                      <Button type="submit" className="w-full">
                        Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="font-heading font-bold text-3xl mb-6">Contact Information</h2>
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <MapPin className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">Address</h3>
                            <p className="text-muted-foreground">{contact.address}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Phone className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">Phone</h3>
                            <p className="text-muted-foreground">{contact.phone}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Mail className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">Email</h3>
                            <p className="text-muted-foreground">{contact.email}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Clock className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">Office Hours</h3>
                            <p className="text-muted-foreground">{contact.office_hours}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
