import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { LoginForm } from "@/components/auth/login-form"
import { signIn } from "next-auth/react"

const pushMock = jest.fn()

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}))

jest.mock("next/router", () => ({
  useRouter: () => ({
    push: pushMock,
    query: {},
  }),
}))

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders login form", () => {
    render(<LoginForm />)

    expect(
      screen.getByRole("heading", {
        name: /login to your account/i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByRole("button", { name: /^login$/i })
    ).toBeInTheDocument()

    expect(
      screen.getByRole("button", {
        name: /login with github/i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByRole("button", {
        name: /login with google/i,
      })
    ).toBeInTheDocument()
  })

  it("redirects to dashboard when login success", async () => {
    ;(signIn as jest.Mock).mockResolvedValue({
      ok: true,
    })

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "admin@mail.com" },
    })

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    })

    fireEvent.click(
      screen.getByRole("button", {
        name: /^login$/i,
      })
    )

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard")
    })
  })

  it("shows error when login failed", async () => {
    ;(signIn as jest.Mock).mockResolvedValue({
      ok: false,
    })

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "wrong@mail.com" },
    })

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpass" },
    })

    fireEvent.click(
      screen.getByRole("button", {
        name: /^login$/i,
      })
    )

    await waitFor(() => {
      expect(
        screen.getByText("Email atau password salah")
      ).toBeInTheDocument()
    })
  })

  it("calls github oauth login", async () => {
    ;(signIn as jest.Mock).mockResolvedValue({})

    render(<LoginForm />)

    fireEvent.click(
      screen.getByRole("button", {
        name: /login with github/i,
      })
    )

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith(
        "github",
        expect.objectContaining({
          redirect: false,
          callbackUrl: "/dashboard",
        })
      )
    })
  })

  it("calls google oauth login", async () => {
    ;(signIn as jest.Mock).mockResolvedValue({})

    render(<LoginForm />)

    fireEvent.click(
      screen.getByRole("button", {
        name: /login with google/i,
      })
    )

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith(
        "google",
        expect.objectContaining({
          redirect: false,
          callbackUrl: "/dashboard",
        })
      )
    })
  })
})