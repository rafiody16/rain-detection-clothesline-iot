import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddDeviceWizard } from "@/components/custom/add-device-wizard";
import { toast } from "sonner";

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockAddDevice = jest.fn();
const mockSetShowAddWizard = jest.fn();

jest.mock("@/contexts/device-context", () => ({
  useDevice: () => ({
    showAddWizard: true,
    setShowAddWizard: mockSetShowAddWizard,
    addDevice: mockAddDevice,
  }),
}));

describe("AddDeviceWizard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders add device dialog", () => {
    render(<AddDeviceWizard />);

    expect(
      screen.getByRole("heading", {
        name: /add new device/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/a1b2c3d4e5f6/i)
    ).toBeInTheDocument();
  });

  it("continue button disabled when device id not 12 chars", () => {
    render(<AddDeviceWizard />);

    const button = screen.getByRole("button", {
      name: /continue/i,
    });

    expect(button).toBeDisabled();
  });

  it("enables continue button when device id has 12 chars", () => {
    render(<AddDeviceWizard />);

    const input = screen.getByLabelText(/device id/i);

    fireEvent.change(input, {
      target: {
        value: "A1B2C3D4E5F6",
      },
    });

    expect(
      screen.getByRole("button", {
        name: /continue/i,
      })
    ).toBeEnabled();
  });

  it("shows error for invalid device id", async () => {
    render(<AddDeviceWizard />);

    const input = screen.getByLabelText(/device id/i);

    fireEvent.change(input, {
      target: {
        value: "ABCDEFGHIJKL",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue/i,
      })
    );

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Invalid Device ID")
    );
  });

  it("updates character counter", () => {
    render(<AddDeviceWizard />);

    const input = screen.getByLabelText(/device id/i);

    fireEvent.change(input, {
      target: {
        value: "ABCDEF",
      },
    });

    expect(screen.getByText("6/12 characters")).toBeInTheDocument();
  });

  it("closes dialog when onOpenChange triggered", () => {
    render(<AddDeviceWizard />);

    mockSetShowAddWizard(false);

    expect(mockSetShowAddWizard).toHaveBeenCalledWith(false);
  });
});