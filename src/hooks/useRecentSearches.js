// src/hooks/useRecentSearches.js
// ============================================
// RECENT SEARCHES HOOK
// ============================================
// Manages recent city searches with localStorage

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'skycast_recent_searches';
const MAX_SEARCHES = 5;

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Add a city to recent searches
  const addSearch = (city) => {
    setRecentSearches((prev) => {
      // Remove if already exists
      const filtered = prev.filter((c) => c.toLowerCase() !== city.toLowerCase());
      // Add to front
      const updated = [city, ...filtered];
      // Limit to MAX_SEARCHES
      const limited = updated.slice(0, MAX_SEARCHES);
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
      return limited;
    });
  };

  // Clear all recent searches
  const clearSearches = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentSearches([]);
  };

  return { recentSearches, addSearch, clearSearches };
}