import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {SignupForm} from "@/components/auth/signup-form";
import { signIn } from "next-auth/react";

const pushMock = jest.fn();

jest.mock("next/router", () => ({
    useRouter() {
        return {
        push: pushMock,
        query: {},
        };
    },
    }));

    jest.mock("next-auth/react", () => ({
    signIn: jest.fn(),
    }));

    describe("SignupForm", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    test("renders signup form", () => {
        render(<SignupForm />);

        expect(
        screen.getByRole("heading", {
            name: /create your account/i,
        })
        ).toBeInTheDocument();

        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    test("shows full name required error", async () => {
        render(<SignupForm />);

        fireEvent.click(
        screen.getByRole("button", {
            name: /create account/i,
        })
        );

        expect(
        await screen.findByText(/full name is required/i)
        ).toBeInTheDocument();
    });

    test("shows invalid email error", async () => {
        render(<SignupForm />);

        fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: "John Doe" },
        });

        fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "invalid-email" },
        });

        fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: "12345678" },
        });

        fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: "12345678" },
        });

        fireEvent.click(
        screen.getByRole("button", {
            name: /create account/i,
        })
        );

        expect(
        await screen.findByText(/please enter a valid email address/i)
        ).toBeInTheDocument();
    });

    test("shows password minimum length error", async () => {
        render(<SignupForm />);

        fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: "John Doe" },
        });

        fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "john@mail.com" },
        });

        fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: "1234567" },
        });

        fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: "1234567" },
        });

        fireEvent.click(
        screen.getByRole("button", {
            name: /create account/i,
        })
        );

        expect(
        await screen.findByText(/password must be at least 8 characters/i)
        ).toBeInTheDocument();
    });

    test("shows password mismatch error", async () => {
        render(<SignupForm />);

        fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: "John Doe" },
        });

        fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "john@mail.com" },
        });

        fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: "12345678" },
        });

        fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: "87654321" },
        });

        fireEvent.click(
        screen.getByRole("button", {
            name: /create account/i,
        })
        );

        expect(
        await screen.findByText(/passwords do not match/i)
        ).toBeInTheDocument();
    });

    test("redirects to login after successful registration", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        json: async () => ({}),
        });

        render(<SignupForm />);

        fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: "John Doe" },
        });

        fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "john@mail.com" },
        });

        fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: "12345678" },
        });

        fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: "12345678" },
        });

        fireEvent.click(
        screen.getByRole("button", {
            name: /create account/i,
        })
        );

        await waitFor(() => {
        expect(pushMock).toHaveBeenCalledWith("/auth/login");
        });
    });

    test("shows email already exist error", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
        status: 400,
        json: async () => ({
            message: "Email already exist",
        }),
        });

        render(<SignupForm />);

        fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: "John Doe" },
        });

        fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "john@mail.com" },
        });

        fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: "12345678" },
        });

        fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: "12345678" },
        });

        fireEvent.click(
        screen.getByRole("button", {
            name: /create account/i,
        })
        );

        expect(
        await screen.findByText(/email already exist/i)
        ).toBeInTheDocument();
    });

    test("calls github oauth signup", async () => {
        render(<SignupForm />);

        fireEvent.click(screen.getByText(/github/i));

        await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith(
            "github",
            expect.objectContaining({
            redirect: false,
            })
        );
        });
    });

    test("calls google oauth signup", async () => {
        render(<SignupForm />);

        fireEvent.click(screen.getByText(/google/i));

        await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith(
            "google",
            expect.objectContaining({
            redirect: false,
            })
        );
        });
    });
});