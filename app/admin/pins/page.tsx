"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PINGenerator } from "@/components/admin/pins/pin-generator"
import { PINGenerationHistory } from "@/components/admin/pins/pin-generation-history"
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
        <p className="text-muted-foreground">
          Generate and track PINs in real time — the same records used for PIN shop, validation, admissions, and result
          checks.
        </p>
      </div>

      <PINStats refreshKey={refreshKey} />

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate PINs</TabsTrigger>
          <TabsTrigger value="admission">Admission PINs</TabsTrigger>
          <TabsTrigger value="result">Result PINs</TabsTrigger>
          <TabsTrigger value="history">Generation History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <PINGenerator onGenerated={handlePINsGenerated} refreshKey={refreshKey} />
        </TabsContent>

        <TabsContent value="admission">
          <PINList type="admission" refreshKey={refreshKey} />
        </TabsContent>

        <TabsContent value="result">
          <PINList type="result" refreshKey={refreshKey} />
        </TabsContent>

        <TabsContent value="history">
          <PINGenerationHistory refreshKey={refreshKey} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
