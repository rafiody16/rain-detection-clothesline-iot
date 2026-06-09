import { render, screen } from "@testing-library/react";
import { SensorChart } from "@/components/custom/sensor-chart";

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: any) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: ({ dataKey }: any) => (
    <div data-testid={`area-${dataKey}`} />
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

jest.mock("@/components/ui/switch-badge", () => ({
  SwitchBadge: ({ status }: { status: string }) => (
    <div data-testid="switch-badge">{status}</div>
  ),
}));

describe("SensorChart", () => {
  const mockData = [
    {
      timestampValue: Date.now(),
      temperature: 30,
      humidity: 80,
    },
  ];

  const mockConfig = [
    {
      key: "temperature",
      name: "Temperature",
      color: "#ef4444",
      gradientId: "tempGradient",
      unit: "°C",
    },
  ];

  it("renders title and description", () => {
    render(
      <SensorChart
        data={mockData}
        config={mockConfig}
        title="Temperature Chart"
        desc="Live sensor data"
        isOnline={true}
      />
    );

    expect(
      screen.getByText("Temperature Chart")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Live sensor data")
    ).toBeInTheDocument();
  });

  it("shows live badge when device is online", () => {
    render(
      <SensorChart
        data={mockData}
        config={mockConfig}
        title="Temperature"
        isOnline={true}
      />
    );

    expect(
      screen.getByTestId("switch-badge")
    ).toHaveTextContent("live");
  });

  it("shows off badge when device is offline", () => {
    render(
      <SensorChart
        data={mockData}
        config={mockConfig}
        title="Temperature"
        isOnline={false}
      />
    );

    expect(
      screen.getByTestId("switch-badge")
    ).toHaveTextContent("off");
  });

  it("renders chart container", () => {
    render(
      <SensorChart
        data={mockData}
        config={mockConfig}
        title="Temperature"
        isOnline={true}
      />
    );

    expect(
      screen.getByTestId("responsive-container")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("area-chart")
    ).toBeInTheDocument();
  });

  it("renders axes and tooltip", () => {
    render(
      <SensorChart
        data={mockData}
        config={mockConfig}
        title="Temperature"
        isOnline={true}
      />
    );

    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
  });

  it("renders area for each config item", () => {
    render(
      <SensorChart
        data={mockData}
        config={[
          {
            key: "temperature",
            name: "Temperature",
            color: "#ef4444",
            gradientId: "tempGradient",
            unit: "°C",
          },
          {
            key: "humidity",
            name: "Humidity",
            color: "#3b82f6",
            gradientId: "humidityGradient",
            unit: "%",
          },
        ]}
        title="Environment"
        isOnline={true}
      />
    );

    expect(
      screen.getByTestId("area-temperature")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("area-humidity")
    ).toBeInTheDocument();
  });
});