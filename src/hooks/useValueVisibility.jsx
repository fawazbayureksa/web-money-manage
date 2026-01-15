import { useState, useCallback, createContext, useContext } from 'react';

// Create context for value visibility
const ValueVisibilityContext = createContext(null);

// Provider component
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

// Hook to use value visibility
export function useValueVisibility() {
  const context = useContext(ValueVisibilityContext);
  if (!context) {
    throw new Error('useValueVisibility must be used within a ValueVisibilityProvider');
  }
  return context;
}

// Standalone hook for local state (when provider is not needed)
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
