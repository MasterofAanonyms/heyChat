import React, { createContext, useContext, useMemo, useState } from "react";

type AppAvailabilityContextValue = {
  isAvailable: boolean;
  toggleAvailability: () => void;
};

const AppAvailabilityContext = createContext<
  AppAvailabilityContextValue | undefined
>(undefined);

export function AppAvailabilityProvider({ children }: { children: React.ReactNode }) {
  const [isAvailable, setIsAvailable] = useState(true);

  const value = useMemo<AppAvailabilityContextValue>(
    () => ({
      isAvailable,
      toggleAvailability: () => setIsAvailable((current) => !current),
    }),
    [isAvailable],
  );

  return (
    <AppAvailabilityContext.Provider value={value}>
      {children}
    </AppAvailabilityContext.Provider>
  );
}

export function useAppAvailability() {
  const context = useContext(AppAvailabilityContext);

  if (!context) {
    throw new Error("useAppAvailability must be used within AppAvailabilityProvider");
  }

  return context;
}