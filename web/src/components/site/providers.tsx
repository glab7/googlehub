"use client";

import ReactLenis from "lenis/react";
import { ThemeProvider } from "next-themes";
import React from "react";

import { ContactDialog } from "./contact-dialog";

type ContactContextValue = { open: () => void };
const ContactContext = React.createContext<ContactContextValue | null>(null);

export function useContact(): ContactContextValue {
  const ctx = React.useContext(ContactContext);
  if (!ctx) throw new Error("useContact must be used inside <Providers>");
  return ctx;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [contactOpen, setContactOpen] = React.useState(false);
  const value = React.useMemo(() => ({ open: () => setContactOpen(true) }), []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>
        <ContactContext.Provider value={value}>
          {children}
          <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} />
        </ContactContext.Provider>
      </ReactLenis>
    </ThemeProvider>
  );
}
