import { useState, useCallback, createContext, useContext } from 'react';

const ValueVisibilityContext = createContext(null);

export function ValueVisibilityProvider({ children }) {
  const [isHidden, setIsHidden] = useState(false);

  const toggleVisibility = useCallback(() => {
    setIsHidden(prev => !prev);
  }, []);

  const formatValue = useCallback((value, formatter = (v) => v) => {
    if (isHidden) {
      return '••••••';
    }
    return formatter(value);
  }, [isHidden]);

  return (
    <ValueVisibilityContext.Provider value={{ isHidden, toggleVisibility, formatValue }}>
      {children}
    </ValueVisibilityContext.Provider>
  );
}

export function useValueVisibility() {
  const context = useContext(ValueVisibilityContext);
  if (!context) {
    throw new Error('useValueVisibility must be used within a ValueVisibilityProvider');
  }
  return context;
}

export function useLocalValueVisibility() {
  const [isHidden, setIsHidden] = useState(true);

  const toggleVisibility = useCallback(() => {
    setIsHidden(prev => !prev);
  }, []);

  const formatValue = useCallback((value, formatter = (v) => v) => {
    if (isHidden) {
      return '••••••';
    }
    return formatter(value);
  }, [isHidden]);

  return { isHidden, toggleVisibility, formatValue };
}
