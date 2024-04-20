import React, { createContext, useState, useContext } from 'react';

// Create a new context
interface diagnosisContextType {
  diagnosis: string;
  setDiagnosis: () => void;
}


const DiagnosisContext = createContext<diagnosisContextType | null>(null);
// Create a provider component for the DiagnosisContext
export const useDiagnosis = () => {
  const diagnosisContext = useContext(DiagnosisContext);

  if (!diagnosisContext) {
    throw new Error(
      "useCurrentUser has to be used within <diagnosisContext.Provider>"
    );
  }

  return diagnosisContext;
};