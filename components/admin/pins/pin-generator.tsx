"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { calculateExpiryDate } from "@/lib/pin-generator"
import { Download, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

interface PINGeneratorProps {
  onGenerated?: () => void
}

export function PINGenerator({ onGenerated }: PINGeneratorProps) {
  const [pinType, setPinType] = useState<"admission" | "result">("admission")
  const [quantity, setQuantity] = useState(10)
  const [expiryDays, setExpiryDays] = useState(90)
  const [loading, setLoading] = useState(false)
  const [generatedPINs, setGeneratedPINs] = useState<string[]>([])
  const [error, setError] = useState("")
  const [quotaInfo, setQuotaInfo] = useState({ remaining: 30, limit: 30 })

  const handleGenerate = async () => {
    setError("")
    setLoading(true)

    try {
      if (quantity > quotaInfo.remaining) {
        setError(
          `You can only generate ${quotaInfo.remaining} more PINs today. Daily limit is ${quotaInfo.limit} per type.`,
        )
        setLoading(false)
        return
      }

      if (quantity < 1 || quantity > 30) {
        setError("Quantity must be between 1 and 30")
        setLoading(false)
        return
      }

      const res = await fetch("/api/admin/pins/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          pinType,
          quantity,
          expiryDays,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Failed to generate PINs.")
        return
      }

      const pins: string[] = Array.isArray(data.pins) ? data.pins : []
      setGeneratedPINs(pins)
      setQuotaInfo((prev) => ({ ...prev, remaining: Math.max(0, prev.remaining - pins.length) }))

      onGenerated?.()
    } catch {
      setError("Failed to generate PINs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const content = generatedPINs.join("\n")
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${pinType}-pins-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopyAll = () => {
    navigator.clipboard.writeText(generatedPINs.join("\n"))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate New PINs</CardTitle>
          <CardDescription>Create PIN codes for admission or result checking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Daily Quota: {quotaInfo.remaining} of {quotaInfo.limit} {pinType} PINs remaining
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>PIN Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={pinType === "admission" ? "default" : "outline"}
                onClick={() => setPinType("admission")}
                className="w-full"
              >
                Admission
              </Button>
              <Button
                type="button"
                variant={pinType === "result" ? "default" : "outline"}
                onClick={() => setPinType("result")}
                className="w-full"
              >
                Result
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity (Max 30 per day)</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="30"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry (Days from now)</Label>
            <Input
              id="expiry"
              type="number"
              min="1"
              max="365"
              value={expiryDays}
              onChange={(e) => setExpiryDays(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              PINs will expire on: {calculateExpiryDate(expiryDays).toLocaleDateString()}
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              `Generate ${quantity} ${pinType} PIN${quantity > 1 ? "s" : ""}`
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated PINs</CardTitle>
          <CardDescription>
            {generatedPINs.length > 0
              ? `${generatedPINs.length} PIN${generatedPINs.length > 1 ? "s" : ""} generated successfully`
              : "PINs will appear here after generation"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedPINs.length > 0 ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  PINs generated successfully! Download or copy them now.
                </AlertDescription>
              </Alert>

              <div className="max-h-64 overflow-y-auto p-4 rounded-lg bg-muted font-mono text-sm space-y-1">
                {generatedPINs.map((pin, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>
                      {index + 1}. {pin}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleDownload} variant="outline" className="flex-1 bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button onClick={handleCopyAll} variant="outline" className="flex-1 bg-transparent">
                  Copy All
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p>No PINs generated yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
