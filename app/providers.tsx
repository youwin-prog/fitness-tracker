"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { useEffect, type ReactNode } from "react";
import { getUserSettings } from "@/actions/settings-actions";

function ThemeSync() {
  useEffect(() => {
    let isMounted = true;

    void getUserSettings()
      .then((settings) => {
        if (!isMounted) {
          return;
        }

        document.documentElement.classList.toggle("dark", settings.darkMode);
      })
      .catch(() => {
        // Keep the default light theme when the saved settings cannot be loaded.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeSync />
      {children}
    </ClerkProvider>
  );
}
