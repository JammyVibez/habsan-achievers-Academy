import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Key, CheckCircle, XCircle, Clock } from "lucide-react"

export function PINStats() {
  const stats = [
    {
      title: "Total PINs Generated",
      value: "1,245",
      icon: Key,
      description: "All time",
    },
    {
      title: "Active PINs",
      value: "856",
      icon: Clock,
      description: "Not yet used",
    },
    {
      title: "Used PINs",
      value: "389",
      icon: CheckCircle,
      description: "Successfully used",
    },
    {
      title: "Expired PINs",
      value: "124",
      icon: XCircle,
      description: "Past expiry date",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <stat.icon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-heading font-bold text-2xl mb-1">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
