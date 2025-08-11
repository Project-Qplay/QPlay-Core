import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  hideTitleDuringLoading: boolean;
  setHideTitleDuringLoading: (hide: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setIsLoading: () => {},
  hideTitleDuringLoading: false,
  setHideTitleDuringLoading: () => {},
});

export const useLoading = () => useContext(LoadingContext);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hideTitleDuringLoading, setHideTitleDuringLoading] = useState(true);

  const value = {
    isLoading,
    setIsLoading,
    hideTitleDuringLoading,
    setHideTitleDuringLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};
