"use client";

import { ReactNode, useEffect, useState } from "react";

// Composant pour les notifications toast
interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

export const Toast = ({ 
  message, 
  type = "info", 
  duration = 3000, 
  onClose 
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Attendre l'animation de sortie
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeClasses = () => {
    switch (type) {
      case "success":
        return "bg-green-500 border-green-400 text-white";
      case "error":
        return "bg-red-500 border-red-400 text-white";
      case "warning":
        return "bg-yellow-500 border-yellow-400 text-white";
      case "info":
        return "bg-blue-500 border-blue-400 text-white";
      default:
        return "bg-gray-500 border-gray-400 text-white";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "•";
    }
  };

  return (
         <div
       className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } ${getTypeClasses()}`}
    >
      <span className="text-lg font-bold">{getIcon()}</span>
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          if (onClose) {
            setTimeout(onClose, 300);
          }
        }}
        className="ml-2 text-white/80 hover:text-white transition-colors"
      >
        ✕
      </button>
    </div>
  );
};

// Composant pour les indicateurs de chargement
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

export const LoadingSpinner = ({ 
  size = "md", 
  color = "currentColor",
  className = "" 
}: LoadingSpinnerProps) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "lg":
        return "w-8 h-8";
      default:
        return "w-6 h-6";
    }
  };

  return (
    <div className={`animate-spin ${getSizeClasses()} ${className}`}>
      <svg
        className="w-full h-full"
        fill="none"
        viewBox="0 0 24 24"
        style={{ color }}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// Composant pour les boutons avec feedback
interface ButtonWithFeedbackProps {
  children: ReactNode;
  onClick: () => void | Promise<void>;
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  className?: string;
  disabled?: boolean;
  tooltip?: string;
}

export const ButtonWithFeedback = ({
  children,
  onClick,
  loading = false,
  success: _success = false,
  error: _error = false,
  className = "",
  disabled = false,
  tooltip,
}: ButtonWithFeedbackProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleClick = async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);
    setShowSuccess(false);
    setShowError(false);

    try {
      await onClick();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1000);
    } catch {
      setShowError(true);
      setTimeout(() => setShowError(false), 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const getStateClasses = () => {
    if (showSuccess) return "bg-green-500 text-white";
    if (showError) return "bg-red-500 text-white";
    if (isLoading || loading) return "bg-blue-500 text-white";
    return "";
  };

  const button = (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading || loading}
      className={`relative overflow-hidden rounded-md px-4 py-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className} ${getStateClasses()}`}
    >
      <span className={`flex items-center gap-2 transition-all duration-200 ${
        isLoading || loading ? "opacity-0" : "opacity-100"
      }`}>
        {children}
      </span>
      
      {(isLoading || loading) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
        </div>
      )}
      
      {showSuccess && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500 text-white">
          ✓
        </div>
      )}
      
      {showError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500 text-white">
          ✕
        </div>
      )}
    </button>
  );

  if (tooltip) {
    return (
      <div className="relative inline-block">
        {button}
        <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    );
  }

  return button;
};

// Composant pour les indicateurs de progression
interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export const ProgressBar = ({
  progress,
  className = "",
  showLabel = false,
  animated = true,
}: ProgressBarProps) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full ${className}`}>
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ${
            animated ? "animate-pulse" : ""
          }`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-gray-600 text-center">
          {clampedProgress.toFixed(0)}%
        </div>
      )}
    </div>
  );
};
