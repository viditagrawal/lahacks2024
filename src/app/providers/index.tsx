// providers/index.tsx
"use client";
import React, { createContext, useContext, useState } from 'react';

// Create a TypeScript interface if you have specific types for your context.
interface ContextType {
  diag1: string;
  diag2: string;
  setDiag1: (diag1: string) => void;
  setDiag2: (diag2: string) => void;
  diagStory1: string;
  diagStory2: string;
  setDiagStory1: (diag1: string) => void;
  setDiagStory2: (diag2: string) => void;
  // You can add other values to the context as needed
}

// Initialize your context with a default value
const Context = createContext<ContextType | undefined>(undefined);

// Export the context (if you need to use it directly without the hook)
export { Context };

// Export the custom hook for your context
export function useMyContext() {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useMyContext must be used within a ContextProvider');
  }
  return context;
}

// Your ContextProvider component remains the same
export default function ContextProvider({ children }: { children: React.ReactNode }) {
    const [diag1, setDiag1] = useState('');
    const [diag2, setDiag2] = useState('');
    const [diagStory1, setDiagStory1] = useState('');
    const [diagStory2, setDiagStory2] = useState('');

    const value = {
        diag1,
        setDiag1,
        diag2,
        setDiag2,
        diagStory1,
        setDiagStory1,
        diagStory2,
        setDiagStory2
      };

    return (
        <Context.Provider value={value}>
        {children}
        </Context.Provider>
    );
}
