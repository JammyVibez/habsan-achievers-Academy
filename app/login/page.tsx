import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getCurrentUser } from "@/lib/current-user"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) {
    if (user.role === 'student' && user.passwordMustChange) {
      redirect('/student/onboarding')
    }
    redirect(`/${user.role}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
              HAA
            </div>
            <div className="text-left">
              <div className="font-heading font-bold text-lg leading-tight">HABSAN ACHIEVERS</div>
              <div className="text-xs text-muted-foreground">ACADEMY</div>
            </div>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
