import React from "react";
import QuantumTerminalLoader from "./QuantumTerminalLoader";

interface LoadingScreenProps {
  progress: number;
  message?: string;
  hide_title?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  message,
  hide_title = true,
}) => {
  // Add a custom attribute to the body element to indicate loading state
  React.useEffect(() => {
    // Set a custom attribute on the document body
    document.body.setAttribute("data-loading", "true");

    // Clean up on unmount
    return () => {
      document.body.removeAttribute("data-loading");
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black z-[99999]"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      {/* Pass the hide_title prop to indicate loading state */}
      <QuantumTerminalLoader
        progress={progress}
        message={message}
        hide_title={hide_title}
      />

      {/* Add style tag to ensure main menu title is hidden */}
      <style jsx global>{`
        body[data-loading="true"] .main-menu-title {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
