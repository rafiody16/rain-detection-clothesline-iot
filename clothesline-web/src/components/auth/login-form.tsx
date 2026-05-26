import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "../provider/mode-toggle"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/router"
import Link from "next/link"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { push, query } = useRouter()
  const callbackUrl = (query.callbackUrl as string) || "/dashboard"

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    })

    if (!email || !password) {
      setIsLoading(false)
      setError("Email and password are required")
      return
    }

    if (res?.ok) {
      push(callbackUrl)
    } else {
      setError("Email atau password salah")
    }

    setIsLoading(false)
  }

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setError("")
    setIsLoading(true)
    await signIn(provider, { callbackUrl, redirect: false })
    setIsLoading(false)
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit} noValidate
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="fixed right-4 bottom-4 z-50">
            <ModeToggle />
          </div>
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            className="bg-background"
            disabled={isLoading}
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/auth/forgot_password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="bg-background"
            disabled={isLoading}
          />
        </Field>
        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Login"}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={() => handleOAuthSignIn("github")}
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Login with GitHub
          </Button>
          {/* Login With Google */}
          <Button
            variant="outline"
            type="button"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M21.805 10.023h-9.806v3.954h5.654c-.245 1.246-.982 2.303-2.09 3.01v2.497h3.384c1.983-1.825 3.128-4.517 3.128-7.461 0-.503-.045-.994-.07-1.999z"
                fill="#4285F4"
              />
              <path
                d="M11.999 21.805c2.835 0 5.218-.938 6.958-2.543l-3.384-2.497c-.941.63-2.144 1-3.574 1-2.747 0-5.075-1.856-5.905-4.354H2.11v2.73c1.74 3.43 5.303 5.664 9.889 5.664z"
                fill="#34A853"
              />
              <path
                d="M6.094 13.999c-.21-.63-.33-1.3-.33-1.989s.12-1.36.33-1.989V7.28H2.11C1.42 8.82 1 10.38 1 11.999s.42 3.18 1.11 4.719l2.984-2.72z"
                fill="#FBBC05"
              />
              <path
                d="M11.999 6c1.54 0 2.918.53 4.01 1.57l3.006-3.006C16.214 2.01 13.835 1 11.999 1c-4.586 0-8.149 2.234-9.889 5.664l2.984 2.73C6.924 7.856 9.252 6 11.999 6z"
                fill="#EA4335"
              />
            </svg>
            Login with Google
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
