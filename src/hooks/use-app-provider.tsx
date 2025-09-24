import React, { createContext, useContext } from 'react';
import { useApp as useAppHook } from './use-app';

type AppContextType = ReturnType<typeof useAppHook>;

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const appState = useAppHook();
  return <AppContext.Provider value={appState}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
