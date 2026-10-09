import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext(null);

const DEFAULT_INTERESTS = ['music', 'movies', 'trains'];

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem('lnb_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const [interests, setInterestsState] = useState(() => {
    try {
      const stored = localStorage.getItem('lnb_user_interests');
      return stored ? JSON.parse(stored) : DEFAULT_INTERESTS;
    } catch (e) {
      return DEFAULT_INTERESTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lnb_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      // storage unavailable
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('lnb_user_interests', JSON.stringify(interests));
    } catch (e) {
      // storage unavailable
    }
  }, [interests]);

  const toggleWishlist = (eventId) => {
    setWishlist((prev) => {
      if (prev.includes(eventId)) {
        return prev.filter((id) => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  const isWishlisted = (eventId) => {
    return wishlist.includes(eventId);
  };

  const toggleInterest = (category) => {
    setInterestsState((prev) => {
      if (prev.includes(category)) {
        if (prev.length === 1) return prev; // keep at least one interest
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const setInterests = (newInterests) => {
    setInterestsState(newInterests);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isWishlisted,
        interests,
        toggleInterest,
        setInterests,
        savedCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
