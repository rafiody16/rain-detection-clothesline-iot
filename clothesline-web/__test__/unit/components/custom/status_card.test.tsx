import { render, screen } from "@testing-library/react";
import { StatusCard } from "@/components/custom/servo-status-card";
import type { IoTData } from "@/utils/iot-data";

jest.mock("lucide-react", () => ({
  Sun: () => <div data-testid="sun-icon" />,
  CloudRainWindIcon: () => <div data-testid="cloud-icon" />,
}));

describe("StatusCard", () => {
  const mockFormatSmartTime = jest.fn((ts?: number) =>
    ts ? `formatted-${ts}` : "no-time"
  );

  const createMockIoTData = (override?: Partial<IoTData>): IoTData => ({
    timestamp: "09/06/2026 10:00:00",
    rawTimestamp: "2026-06-09T10:00:00Z",
    timestampValue: 1717930000000,

    suhu: 30,
    lembab: 70,
    ldr: 500,
    intensitasAir: 10,

    mode: "AUTO",
    status: true,
    kondisi: "Normal",

    ...override,
  });

  beforeEach(() => {
    mockFormatSmartTime.mockClear();
  });

  it("renders MASUK state", () => {
    render(
      <StatusCard
        lastActionData={createMockIoTData({ status: true })}
        formatSmartTime={mockFormatSmartTime}
      />
    );

    expect(screen.getByText("MASUK")).toBeInTheDocument();
    expect(screen.getByText("Terlindungi")).toBeInTheDocument();
    expect(screen.getByTestId("cloud-icon")).toBeInTheDocument();
  });

  it("renders KELUAR state", () => {
    render(
      <StatusCard
        lastActionData={createMockIoTData({ status: false })}
        formatSmartTime={mockFormatSmartTime}
      />
    );

    expect(screen.getByText("KELUAR")).toBeInTheDocument();
    expect(screen.getByText("Menjemur")).toBeInTheDocument();
    expect(screen.getByTestId("sun-icon")).toBeInTheDocument();
  });

  it("renders fallback mode", () => {
    render(
      <StatusCard
        lastActionData={createMockIoTData({ mode: "" })}
        formatSmartTime={mockFormatSmartTime}
      />
    );

    expect(screen.getByText("--")).toBeInTheDocument();
  });

  it("calls formatSmartTime correctly", () => {
    render(
      <StatusCard
        lastActionData={createMockIoTData({ timestampValue: 999 })}
        formatSmartTime={mockFormatSmartTime}
      />
    );

    expect(mockFormatSmartTime).toHaveBeenCalledWith(999);
    expect(screen.getByText("formatted-999")).toBeInTheDocument();
  });

  it("handles null data", () => {
    render(
      <StatusCard lastActionData={null} formatSmartTime={mockFormatSmartTime} />
    );

    expect(screen.getByText("KELUAR")).toBeInTheDocument();
    expect(screen.getByText("--")).toBeInTheDocument();
  });
});