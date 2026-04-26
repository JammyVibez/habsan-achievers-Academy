"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Trash2 } from "lucide-react"

interface PINListProps {
  type: "admission" | "result"
}

export function PINList({ type }: PINListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data - will be replaced with actual database query
  const mockPINs = [
    {
      pin: "ADM1-2X4Y-8Z9K",
      status: "unused",
      generated: "2024-12-10",
      expires: "2025-03-10",
      usedBy: null,
    },
    {
      pin: "ADM2-5H7J-3M6N",
      status: "unused",
      generated: "2024-12-10",
      expires: "2025-03-10",
      usedBy: null,
    },
    {
      pin: "ADM3-9P2Q-7R4S",
      status: "used",
      generated: "2024-12-09",
      expires: "2025-03-09",
      usedBy: "John Doe",
      usedAt: "2024-12-09 14:30",
    },
    {
      pin: "ADM4-6T8U-1V3W",
      status: "expired",
      generated: "2024-09-10",
      expires: "2024-12-09",
      usedBy: null,
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unused":
        return <Badge className="bg-green-500">Active</Badge>
      case "used":
        return <Badge className="bg-blue-500">Used</Badge>
      case "expired":
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{type === "admission" ? "Admission" : "Result"} PINs</CardTitle>
        <CardDescription>View and manage {type} PIN codes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by PIN code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline">Filter</Button>
        </div>

        <div className="space-y-2">
          {mockPINs.map((pin, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono font-semibold">{pin.pin}</span>
                  {getStatusBadge(pin.status)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Generated: {pin.generated} | Expires: {pin.expires}
                  {pin.usedBy && (
                    <>
                      <br />
                      Used by: {pin.usedBy} on {pin.usedAt}
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" disabled={pin.status === "used"}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
