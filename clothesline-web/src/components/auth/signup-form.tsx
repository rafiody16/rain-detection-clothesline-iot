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
import { useRouter } from "next/router"
import { signIn } from "next-auth/react"
import Link from "next/link"

export function SignupForm({
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
    const form = event.currentTarget

    const formData = new FormData(form)
    const fullname = formData.get("fullname") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (fullname == null || fullname.trim() === "") {
      setIsLoading(false)
      setError("Full name is required")
      return
    }

    if (email == null || email.trim() === "") {
      setIsLoading(false)
      setError("Email is required")
      return
    }

    if (!emailRegex.test(email)) {
      setIsLoading(false)
      setError("Please enter a valid email address")
      return
    }

    if (password.length < 8) {
      setIsLoading(false)
      setError("Password must be at least 8 characters")
      return
    }

    if (password !== confirmPassword) {
      setIsLoading(false)
      setError("Passwords do not match")
      return
    }

    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        fullname,
        password,
      }),
    })

    if (response.status === 200) {
      form.reset()
      setIsLoading(false)
      push("/auth/login")
      return
    }

    setIsLoading(false)
    setError(response.status === 400 ? "Email already exist" : "An error occured")
  }

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setError("")
    setIsLoading(true)
    await signIn(provider, { callbackUrl, redirect: false })
    setIsLoading(false)
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} noValidate {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="fixed right-4 bottom-4 z-50">
            <ModeToggle />
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the form below to create your account
          </p>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            name="fullname"
            type="text"
            placeholder="John Doe"
            required
            className="bg-background"
            disabled={isLoading}
          />
        </Field>
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
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="bg-background"
            disabled={isLoading}
          />
          <FieldDescription>
            Must be at least 6 characters long.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            required
            className="bg-background"
            disabled={isLoading}
          />
          <FieldDescription>Please confirm your password.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Create Account"}
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
            Sign up with GitHub
          </Button>
          {/* Sign up with Google */}
            <Button
              variant="outline"
              type="button"
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading}
            >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M21.805 10.023h-9.806v3.954h5.654c-.245 1.246-.982 2.303-2.094 3.01v2.497h3.39c1.987-1.83 3.134-4.53 3.134-7.461 0-.503-.045-.994-.078-1.999z"
                fill="#4285F4"
              />
              <path
                d="M11.999 22c2.699 0 4.964-.893 6.619-2.422l-3.39-2.497c-.942.63-2.15 1-3.229 1-2.483 0-4.59-1.678-5.344-3.936H2.998v2.475C4.655 19.327 8.109 22 11.999 22z"
                fill="#34A853"
              />
              <path
                d="M6.655 13.642a5.998 5.998 0 010-3.284V7.882H2.998a9.999 9.999 0 000 8.236l3.657-2.475z"
                fill="#FBBC05"
              />
              <path
                d="M11.999 5c1.473 0 2.794.506 3.835 1.498l2.874-2.874C16.961 2.108 14.701 1 11.999 1c-4.89 0-9.344 2.673-11.001 6.658l3.657 2.475C7.409 6.678 9.517 5 11.999 5z"
                fill="#EA4335"
              />
            </svg>
            Sign up with Google
          </Button>
        </Field>
        <Field>
          <FieldDescription className="px-6 text-center">
            Already have an account? <Link href="/auth/login">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
