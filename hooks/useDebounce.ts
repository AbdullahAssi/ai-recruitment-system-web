import { useState, useEffect } from "react";

/**
 * Debounces a value by the specified delay.
 * Useful for preventing excessive API calls on fast-changing inputs like search.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 400)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
