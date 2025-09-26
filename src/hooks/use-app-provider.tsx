
import React, { createContext, useContext, useEffect } from 'react';
import { useApp as useAppHook } from './use-app';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type AppContextType = ReturnType<typeof useAppHook>;

const AppContext = createContext<AppContextType | null>(null);

function FullPageLoader() {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="font-semibold text-lg">Connecting...</p>
            </div>
        </div>
    );
}

const AppController: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const appState = useAppHook();
    const router = useRouter();
    const pathname = usePathname();

    const { isConnected, isNewUser, initialCheckComplete } = appState;

    useEffect(() => {
        if (isConnected && initialCheckComplete && isNewUser && pathname !== '/profile') {
            router.push('/profile');
        }
    }, [isConnected, initialCheckComplete, isNewUser, pathname, router]);

    const showLoader = appState.isConnected && !appState.initialCheckComplete;

    return (
        <AppContext.Provider value={appState}>
            {showLoader && <FullPageLoader />}
            {children}
        </AppContext.Provider>
    );
};


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppController>
        {children}
    </AppController>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
