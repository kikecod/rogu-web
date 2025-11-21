import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type ModeType = 'cliente' | 'duenio';

interface ModeContextType {
  mode: ModeType;
  setMode: (mode: ModeType) => void;
  toggleMode: () => void;
  isOwnerMode: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const useModeContext = () => {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useModeContext must be used within a ModeProvider');
  }
  return context;
};

interface ModeProviderProps {
  children: ReactNode;
}

export const ModeProvider: React.FC<ModeProviderProps> = ({ children }) => {
  const [mode, setModeState] = useState<ModeType>('cliente');

  // Cargar modo desde localStorage al iniciar
  useEffect(() => {
    const savedMode = localStorage.getItem('userMode') as ModeType;
    if (savedMode === 'duenio' || savedMode === 'cliente') {
      setModeState(savedMode);
    }
  }, []);

  const setMode = (newMode: ModeType) => {
    setModeState(newMode);
    localStorage.setItem('userMode', newMode);
  };

  const toggleMode = () => {
    const newMode = mode === 'cliente' ? 'duenio' : 'cliente';
    setMode(newMode);
  };

  const value: ModeContextType = {
    mode,
    setMode,
    toggleMode,
    isOwnerMode: mode === 'duenio',
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
};

export default ModeProvider;
