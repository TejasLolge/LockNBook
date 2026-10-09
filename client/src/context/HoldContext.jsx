import React, { createContext, useContext, useState, useEffect } from 'react';

const HoldContext = createContext(null);

export function HoldProvider({ children }) {
  const [activeHold, setActiveHoldState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('lnb_active_hold');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          return parsed;
        }
        sessionStorage.removeItem('lnb_active_hold');
      }
    } catch (e) {
      // Ignore parse errors
    }
    return null;
  });

  const setHold = (hold) => {
    setActiveHoldState(hold);
    if (hold) {
      sessionStorage.setItem('lnb_active_hold', JSON.stringify(hold));
    } else {
      sessionStorage.removeItem('lnb_active_hold');
    }
  };

  const clearHold = () => {
    setHold(null);
  };

  return (
    <HoldContext.Provider value={{ activeHold, setHold, clearHold }}>
      {children}
    </HoldContext.Provider>
  );
}

export function useHold() {
  const context = useContext(HoldContext);
  if (!context) {
    throw new Error('useHold must be used within a HoldProvider');
  }
  return context;
}
