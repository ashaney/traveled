import { useState, useEffect } from 'react';

// Helper function to revive Date objects from JSON
function reviveDates(key: string, value: any) {
  if (typeof value === 'string' && 
      (key === 'visitDate' || key === 'createdAt' || key === 'updatedAt') &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value);
  }
  return value;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item, reviveDates);
        setStoredValue(parsed);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      setIsLoaded(true);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T), callback?: () => void) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      // Call callback after both state and localStorage are updated
      if (callback) {
        setTimeout(callback, 0);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isLoaded] as const;
}