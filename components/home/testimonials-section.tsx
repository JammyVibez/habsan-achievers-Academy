import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Mrs. Aisha Mohammed",
    role: "Parent",
    content:
      "HABSAN ACHIEVERS ACADEMY has been a blessing to our family. My children have grown academically and morally. The teachers are dedicated and caring.",
    rating: 5,
  },
  {
    name: "Mr. Chukwudi Okafor",
    role: "Parent",
    content:
      "The quality of education here is exceptional. My daughter improved significantly in her studies and gained confidence. I highly recommend this school.",
    rating: 5,
  },
  {
    name: "Mrs. Fatima Bello",
    role: "Parent",
    content:
      "A wonderful school with excellent facilities and a safe environment. The staff truly care about each child's development and success.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-accent">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4 text-balance">What Parents Say About Us</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Hear from parents who have entrusted their children's education to us
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
