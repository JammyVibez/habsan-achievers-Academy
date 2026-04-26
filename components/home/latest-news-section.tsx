import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"

const news = [
  {
    title: "2024/2025 Admission Now Open",
    date: "January 15, 2024",
    excerpt:
      "We are excited to announce that admissions for the new academic session are now open. Limited slots available.",
    image: "/school-admission-open-sign.jpg",
  },
  {
    title: "Outstanding WAEC Results 2023",
    date: "December 20, 2023",
    excerpt:
      "Our students achieved 98% pass rate in WAEC examinations with 45% scoring distinctions in 5 subjects or more.",
    image: "/students-celebrating-exam-success.jpg",
  },
  {
    title: "New Science Laboratory Inaugurated",
    date: "November 10, 2023",
    excerpt:
      "State-of-the-art science laboratory equipped with modern equipment to enhance practical learning experience.",
    image: "/modern-school-science-laboratory.jpg",
  },
]

export function LatestNewsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-2 text-balance">Latest News & Updates</h2>
            <p className="text-muted-foreground text-lg text-pretty">
              Stay informed about what's happening at our school
            </p>
          </div>
          <Button asChild variant="outline" className="hidden md:inline-flex bg-transparent">
            <Link href="/noticeboard">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <Card key={index} className="overflow-hidden border-border hover:border-primary/50 transition-colors">
              <div className="aspect-video overflow-hidden">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>{item.date}</span>
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">{item.excerpt}</p>
                <Button variant="link" className="p-0 h-auto">
                  Read More
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline">
            <Link href="/noticeboard">
              View All News
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
