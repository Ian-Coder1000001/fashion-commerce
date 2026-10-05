"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[root layout error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", marginBottom: "12px" }}>
          Something went wrong
        </h1>
        <p style={{ color: "#6B6B68", marginBottom: "24px" }}>
          The page failed to load. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            border: "1px solid #141414",
            background: "none",
            padding: "12px 32px",
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}