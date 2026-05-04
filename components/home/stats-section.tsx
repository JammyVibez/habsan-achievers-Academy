import { Users, GraduationCap, Award, BookOpen } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "500+",
    label: "Students Enrolled",
  },
  {
    icon: GraduationCap,
    value: "50+",
    label: "Qualified Teachers",
  },
  {
    icon: Award,
    value: "95%",
    label: "Success Rate",
  },
  {
    icon: BookOpen,
    value: "15+",
    label: "Years of Excellence",
  },
]

export function StatsSection() {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/10">
                  <stat.icon className="h-7 w-7" />
                </div>
              </div>
              <div className="font-heading font-bold text-3xl md:text-4xl mb-1">{stat.value}</div>
              <div className="text-sm text-primary-foreground/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
