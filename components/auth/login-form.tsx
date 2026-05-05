"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { isValidAdmissionNumber } from "@/lib/student-utils"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    identifier: "", // Can be email or admission number
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: formData.identifier.trim(),
          password: formData.password,
        }),
      })

      const raw = await response.text()
      let data: { error?: string; redirectTo?: string } = {}
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {}
      } catch {
        throw new Error('Unexpected response from server. Please try again.')
      }

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error(
            data.error ||
              'Cannot reach the database. Check DATABASE_URL, Supabase project status, and your network (VPN/firewall).',
          )
        }
        throw new Error(data.error || "Invalid credentials. Please check your admission number/email and password.")
      }

      const fallbackRoute = isValidAdmissionNumber(formData.identifier.trim()) ? "/student" : "/admin"
      const next = (data.redirectTo || fallbackRoute) as string
      // Full navigation avoids occasional App Router + cookie edge cases after login.
      window.location.assign(next)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="identifier">Email or Admission Number</Label>
        <Input
          id="identifier"
          type="text"
          placeholder="your.email@example.com or HAA/2024/001"
          value={formData.identifier}
          onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
          required
        />
        <p className="text-xs text-muted-foreground">
          Students: Use admission number (HAA/YYYY/###) or email. Teachers/Admin: Use email
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded border-input" />
          <span className="text-muted-foreground">Remember me</span>
        </label>
        <a href="#" className="text-primary hover:underline">
          Forgot password?
        </a>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  )
}
