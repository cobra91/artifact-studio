"use client";

import { useCallback, useEffect, useState } from "react";

interface HelpTooltip {
  id: string;
  target: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
}

interface OnboardingStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
  action?: () => void;
}

interface HelpSystemProps {
  showOnboarding: boolean;
  onFinishOnboarding: () => void;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    target: "body",
    title: "Welcome to Visual Artifact Studio!",
    content:
      "Create stunning UI components with our powerful visual editor. Let's take a quick tour!",
    position: "bottom",
  },
  {
    id: "component-library",
    target: ".component-library",
    title: "Component Library",
    content:
      "Drag components from here to the canvas to start building your UI.",
    position: "right",
  },
  {
    id: "canvas",
    target: ".visual-canvas",
    title: "Visual Canvas",
    content:
      "This is where you'll design your components. Click to select, drag to move, and resize using the handles.",
    position: "top",
  },
  {
    id: "style-panel",
    target: ".style-panel",
    title: "Style Panel",
    content:
      "Customize the appearance of your selected components here. Explore different tabs for layout, typography, and more.",
    position: "left",
  },
  {
    id: "live-preview",
    target: ".live-preview",
    title: "Live Preview",
    content:
      "See your component in action! The preview updates in real-time as you make changes.",
    position: "left",
  },
  {
    id: "keyboard-shortcuts",
    target: ".command-button",
    title: "Command Palette",
    content:
      "Press Ctrl+K or click here to access all features quickly. Try copying with Ctrl+C and pasting with Ctrl+V!",
    position: "bottom",
  },
];

export const HelpSystem = ({
  showOnboarding,
  onFinishOnboarding,
}: HelpSystemProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (showOnboarding && isClient) {
      setIsVisible(true);
      setCurrentStep(0);
    }
  }, [showOnboarding, isClient]);

  const finishOnboarding = useCallback(() => {
    setIsVisible(false);
    onFinishOnboarding();
    if (typeof window !== 'undefined') {
      localStorage.setItem("onboarding-completed", "true");
    }
  }, [onFinishOnboarding]);

  const nextStep = useCallback(() => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishOnboarding();
    }
  }, [currentStep, finishOnboarding]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const skipOnboarding = useCallback(() => {
    finishOnboarding();
  }, [finishOnboarding]);

  const getElementPosition = useCallback((selector: string) => {
    if (typeof window === 'undefined') {
      return { top: 100, left: 100, width: 200, height: 100 };
    }
    
    const element = document.querySelector(selector);
    if (!element) return { top: 100, left: 100, width: 200, height: 100 };

    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    };
  }, []);

  if (!isClient || !isVisible || !showOnboarding) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const position = getElementPosition(step.target);

  const getTooltipStyle = () => {
    const offset = 20;
    const style: any = { position: "fixed", zIndex: 1000 };

    switch (step.position) {
      case "top":
        style.top = position.top - offset;
        style.left = position.left + (position.width || 0) / 2;
        style.transform = "translate(-50%, -100%)";
        break;
      case "bottom":
        style.top = (position.top || 0) + (position.height || 0) + offset;
        style.left = position.left + (position.width || 0) / 2;
        style.transform = "translateX(-50%)";
        break;
      case "left":
        style.top = position.top + (position.height || 0) / 2;
        style.left = position.left - offset;
        style.transform = "translate(-100%, -50%)";
        break;
      case "right":
        style.top = position.top + (position.height || 0) / 2;
        style.left = (position.left || 0) + (position.width || 0) + offset;
        style.transform = "translateY(-50%)";
        break;
    }

    return style;
  };

  return (
    <>
      {/* Overlay */}
      <div className="bg-opacity-50 fixed inset-0 z-50 bg-black">
        {/* Highlight area */}
        <div
          className="bg-opacity-10 absolute rounded-lg border-4 border-blue-500 bg-white shadow-lg"
          style={{
            top: (position.top || 0) - 8,
            left: (position.left || 0) - 8,
            width: (position.width || 0) + 16,
            height: (position.height || 0) + 16,
          }}
        />

        {/* Tooltip */}
        <div
          className="max-w-sm rounded-lg bg-white p-6 shadow-xl"
          style={getTooltipStyle()}
        >
          <div className="mb-4">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {step.title}
            </h3>
            <p className="leading-relaxed">{step.content}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <span className="text-sm text-gray-500">
                {currentStep + 1} of {ONBOARDING_STEPS.length}
              </span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={skipOnboarding}
                className="px-3 py-1.5 text-sm text-gray-800"
              >
                Skip
              </button>
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="rounded bg-gray-200 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-300"
                >
                  Back
                </button>
              )}
              <button
                onClick={nextStep}
                className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700"
              >
                {currentStep < ONBOARDING_STEPS.length - 1 ? "Next" : "Finish"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Composant pour les tooltips d'aide contextuelle
interface HelpTooltipProps {
  children: React.ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

export const HelpTooltip = ({
  children,
  content,
  position = "top",
}: HelpTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={`absolute z-50 rounded-lg bg-gray-900 px-3 py-2 text-sm whitespace-nowrap text-white shadow-lg ${position === "top" ? "bottom-full left-1/2 mb-2 -translate-x-1/2 transform" : ""} ${position === "bottom" ? "top-full left-1/2 mt-2 -translate-x-1/2 transform" : ""} ${position === "left" ? "top-1/2 right-full mr-2 -translate-y-1/2 transform" : ""} ${position === "right" ? "top-1/2 left-full ml-2 -translate-y-1/2 transform" : ""} `}
        >
          {content}
          <div
            className={`absolute h-2 w-2 rotate-45 transform bg-gray-900 ${position === "top" ? "top-full left-1/2 -mt-1 -translate-x-1/2" : ""} ${position === "bottom" ? "bottom-full left-1/2 -mb-1 -translate-x-1/2" : ""} ${position === "left" ? "top-1/2 left-full -ml-1 -translate-y-1/2" : ""} ${position === "right" ? "top-1/2 right-full -mr-1 -translate-y-1/2" : ""} `}
          />
        </div>
      )}
    </div>
  );
};
