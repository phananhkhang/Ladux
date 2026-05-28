import React from "react";
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      toastOptions={{
        style: {
          background: "rgba(15,15,15,0.95)",
          color: "white",
          border: "1px solid rgba(0,255,102,0.25)",
          borderRadius: "14px",
          backdropFilter: "blur(20px)",
        },
      }}
    />
  );
}
