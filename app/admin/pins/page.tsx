"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PINGenerator } from "@/components/admin/pins/pin-generator"
import { PINList } from "@/components/admin/pins/pin-list"
import { PINStats } from "@/components/admin/pins/pin-stats"

export default function PINManagementPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handlePINsGenerated = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-3xl mb-2">PIN Code Management</h2>
        <p className="text-muted-foreground">Generate and manage admission and result checking PIN codes</p>
      </div>

      <PINStats key={refreshKey} />

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate PINs</TabsTrigger>
          <TabsTrigger value="admission">Admission PINs</TabsTrigger>
          <TabsTrigger value="result">Result PINs</TabsTrigger>
          <TabsTrigger value="history">Generation History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <PINGenerator onGenerated={handlePINsGenerated} />
        </TabsContent>

        <TabsContent value="admission">
          <PINList type="admission" key={`admission-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="result">
          <PINList type="result" key={`result-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Generation History</CardTitle>
              <CardDescription>View all PIN generation activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: "2024-12-10 10:30 AM", type: "Admission", count: 30, admin: "System Admin" },
                  { date: "2024-12-10 09:15 AM", type: "Result", count: 25, admin: "System Admin" },
                  { date: "2024-12-09 02:45 PM", type: "Admission", count: 20, admin: "System Admin" },
                  { date: "2024-12-09 11:20 AM", type: "Result", count: 30, admin: "System Admin" },
                ].map((history, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <p className="font-medium">
                        {history.count} {history.type} PINs Generated
                      </p>
                      <p className="text-sm text-muted-foreground">By {history.admin}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">{history.date}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
