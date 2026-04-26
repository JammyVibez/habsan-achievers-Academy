"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Key } from "lucide-react"

export function ResultChecker() {
  const [pin, setPin] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // TODO: Validate PIN and fetch results
      const response = await fetch("/api/pins/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Invalid PIN code")
        setLoading(false)
        return
      }

      // Redirect to results page or show results
      console.log("[v0] PIN validated:", data)
    } catch (err) {
      setError("Failed to validate PIN. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Enter Result PIN
        </CardTitle>
        <CardDescription>Use your result checking PIN code to access your results</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="pin">Result PIN Code</Label>
            <Input
              id="pin"
              placeholder="XXXX-XXXX-XXXX"
              value={pin}
              onChange={(e) => setPin(e.target.value.toUpperCase())}
              maxLength={14}
              className="font-mono text-lg"
              required
            />
            <p className="text-xs text-muted-foreground">Enter the 12-character PIN code provided to you</p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              "Check Results"
            )}
          </Button>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Don't have a PIN code?{" "}
              <a href="/contact" className="text-primary hover:underline">
                Contact the school
              </a>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
