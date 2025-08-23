import { fireEvent, render, screen } from "@testing-library/react";

import { ArtifactBuilder } from "../components/ArtifactBuilder";
import { NotificationProvider } from "../components/ui/notifications";

// Test wrapper with necessary providers
const _TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

describe("ArtifactBuilder", () => {
  it("should add a component and update its style", () => {
    render(<ArtifactBuilder />);

    // Add a text component
    const textButton = screen.getByText("Text");
    fireEvent.click(textButton);

    // Check if the component is added
    const textComponent = screen.getByText("Sample text");
    expect(textComponent).toBeInTheDocument();

    // Select the component
    fireEvent.click(textComponent);

    // Update the style
    const styleTab = screen.getByText("Style");
    fireEvent.click(styleTab);

    const fontSizeInput = screen.getByLabelText("Font Size");
    fireEvent.change(fontSizeInput, { target: { value: "20px" } });

    // Check if the style is updated
    expect(textComponent).toHaveStyle("font-size: 20px");
  });
});
