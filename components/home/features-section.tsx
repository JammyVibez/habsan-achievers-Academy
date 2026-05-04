import { GraduationCap, Users, BookOpen, Award, Shield, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: GraduationCap,
    title: "Quality Education",
    description: "Comprehensive curriculum from Pre-Nursery to SS3 following Nigerian educational standards",
  },
  {
    icon: Users,
    title: "Experienced Teachers",
    description: "Dedicated and qualified educators committed to student success and development",
  },
  {
    icon: BookOpen,
    title: "Modern Facilities",
    description: "Well-equipped classrooms, libraries, and laboratories for enhanced learning",
  },
  {
    icon: Award,
    title: "Academic Excellence",
    description: "Proven track record of outstanding performance in WAEC, NECO, and JAMB",
  },
  {
    icon: Shield,
    title: "Safe Environment",
    description: "Secure campus with 24/7 security and comprehensive student welfare programs",
  },
  {
    icon: Sparkles,
    title: "Holistic Development",
    description: "Focus on academics, character, sports, and extracurricular activities",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4 text-balance">
            Why Choose HABSAN ACHIEVERS ACADEMY?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            We provide a nurturing environment where students excel academically and develop into well-rounded
            individuals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
