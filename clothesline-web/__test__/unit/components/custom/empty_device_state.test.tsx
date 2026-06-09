// __test__/unit/components/custom/empty_device_state.test.tsx

import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyDeviceState } from "@/components/custom/empty-device-state";

const mockSetShowAddWizard = jest.fn();

jest.mock("@/contexts/device-context", () => ({
  useDevice: () => ({
    setShowAddWizard: mockSetShowAddWizard,
  }),
}));

describe("EmptyDeviceState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state content", () => {
    render(<EmptyDeviceState />);

    expect(
      screen.getByRole("heading", {
        name: /no devices connected/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /add your first smart clothesline device/i
      )
    ).toBeInTheDocument();
  });

  it("renders add device button", () => {
    render(<EmptyDeviceState />);

    expect(
      screen.getByRole("button", {
        name: /add your first device/i,
      })
    ).toBeInTheDocument();
  });

  it("opens add wizard when button is clicked", () => {
    render(<EmptyDeviceState />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /add your first device/i,
      })
    );

    expect(mockSetShowAddWizard).toHaveBeenCalledTimes(1);
    expect(mockSetShowAddWizard).toHaveBeenCalledWith(true);
  });

  it("renders feature hints", () => {
    render(<EmptyDeviceState />);

    expect(
      screen.getByText(/easy wifi setup/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/real-time data/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/auto control/i)
    ).toBeInTheDocument();
  });
});