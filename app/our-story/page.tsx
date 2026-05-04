import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Award, Sparkles, Target, Heart, Lightbulb, Trophy } from "lucide-react"

const phases = [
  {
    name: "Pre-Nursery & Nursery",
    age: "2-5 years",
    icon: Heart,
    color: "bg-pink-500",
    description: "The Foundation Phase - Where Learning Begins with Love",
    details:
      "Our youngest learners are nurtured in a warm, caring environment that feels like a home away from home. Through play-based learning, we introduce basic concepts, social skills, and emotional development.",
    features: [
      "Play-based learning approach",
      "Early literacy and numeracy",
      "Social and emotional development",
      "Creative arts and music",
      "Outdoor play and physical development",
    ],
  },
  {
    name: "Primary 1-6",
    age: "6-11 years",
    icon: BookOpen,
    color: "bg-blue-500",
    description: "The Building Phase - Laying Strong Academic Foundations",
    details:
      "Students develop core competencies in reading, writing, mathematics, and science. We emphasize critical thinking, creativity, and character development while maintaining the Nigerian curriculum standards.",
    features: [
      "Comprehensive curriculum coverage",
      "STEM education integration",
      "Language arts development",
      "Character and values education",
      "Sports and extracurricular activities",
    ],
  },
  {
    name: "Junior Secondary (JSS 1-3)",
    age: "12-14 years",
    icon: Lightbulb,
    color: "bg-purple-500",
    description: "The Discovery Phase - Exploring Potential and Interests",
    details:
      "Students transition into more specialized learning, exploring various subjects to discover their strengths and interests. We prepare them for the Basic Education Certificate Examination (BECE).",
    features: [
      "Subject specialization begins",
      "BECE preparation",
      "Leadership development programs",
      "Technology and computer science",
      "Career guidance introduction",
    ],
  },
  {
    name: "Senior Secondary (SS 1-3)",
    age: "15-17 years",
    icon: Trophy,
    color: "bg-green-600",
    description: "The Achievement Phase - Preparing for Excellence",
    details:
      "Our senior students focus on their chosen streams (Science, Commercial, or Arts) as they prepare for WAEC and NECO examinations. We provide intensive academic support and university preparation.",
    features: [
      "Stream-based learning (Science/Commercial/Arts)",
      "WAEC and NECO preparation",
      "University entrance coaching",
      "Advanced research projects",
      "Career counseling and mentorship",
    ],
  },
]

const milestones = [
  {
    year: "2010",
    title: "Foundation",
    description: "HABSAN ACHIEVERS ACADEMY was established with just 25 students and 5 teachers in a modest building.",
  },
  {
    year: "2013",
    title: "First Graduation",
    description: "Our first set of students graduated with outstanding WAEC results, achieving 100% pass rate.",
  },
  {
    year: "2015",
    title: "Expansion",
    description: "Expanded to include modern science laboratories, computer labs, and a well-stocked library.",
  },
  {
    year: "2018",
    title: "Recognition",
    description: "Received state recognition for academic excellence and innovative teaching methods.",
  },
  {
    year: "2020",
    title: "Digital Transformation",
    description: "Launched e-learning platform and integrated technology across all learning phases.",
  },
  {
    year: "2025",
    title: "Present Day",
    description: "Now serving over 1,200 students with 80+ qualified teachers and state-of-the-art facilities.",
  },
]

export default function OurStoryPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">Our Journey</Badge>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-balance">
              The HABSAN ACHIEVERS Story
            </h1>
            <p className="text-lg text-white/90 leading-relaxed">
              From humble beginnings to becoming one of Nigeria's leading educational institutions, our journey has been
              guided by a commitment to excellence, innovation, and nurturing young minds.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-heading font-bold">Our Mission</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To provide quality education that develops the intellectual, moral, and social capabilities of every
                  student, preparing them to become responsible global citizens.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-heading font-bold">Our Vision</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To be the leading educational institution in Nigeria, recognized for academic excellence, character
                  development, and producing future leaders who positively impact society.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-heading font-bold">Our Values</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Excellence, Integrity, Innovation, Respect, and Community. These core values guide everything we do
                  and shape the character of our students.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Learning Phases */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4">Educational Journey</Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Our Learning Phases</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We guide students through carefully designed phases, each tailored to their developmental stage and
              learning needs.
            </p>
          </div>

          <div className="space-y-8">
            {phases.map((phase, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-[300px_1fr] gap-6">
                    <div className={`${phase.color} p-8 text-white flex flex-col justify-center`}>
                      <phase.icon className="h-12 w-12 mb-4" />
                      <h3 className="text-2xl font-heading font-bold mb-2">{phase.name}</h3>
                      <p className="text-white/90 text-sm mb-4">{phase.age}</p>
                      <Badge className="bg-white/20 text-white border-white/30 w-fit">{phase.description}</Badge>
                    </div>
                    <div className="p-8">
                      <p className="text-muted-foreground mb-6 leading-relaxed">{phase.details}</p>
                      <div>
                        <h4 className="font-semibold mb-3">Key Features:</h4>
                        <ul className="grid sm:grid-cols-2 gap-2">
                          {phase.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4">Our History</Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Milestones & Achievements</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A journey of growth, excellence, and continuous improvement over the years.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border md:left-1/2" />

              {/* Timeline items */}
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={index} className="relative">
                    <div className={`md:grid md:grid-cols-2 md:gap-8 ${index % 2 === 0 ? "" : "md:flex-row-reverse"}`}>
                      <div className={index % 2 === 0 ? "md:text-right" : "md:col-start-2"}>
                        <Card className="ml-16 md:ml-0">
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{milestone.year}</Badge>
                            </div>
                            <h3 className="text-xl font-heading font-bold mb-2">{milestone.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{milestone.description}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Timeline dot */}
                    <div className="absolute left-8 top-0 -translate-x-1/2 md:left-1/2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground border-4 border-background">
                        <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary text-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-white/80">Years of Excellence</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1,200+</div>
              <div className="text-white/80">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">80+</div>
              <div className="text-white/80">Qualified Teachers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-white/80">Success Rate</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
