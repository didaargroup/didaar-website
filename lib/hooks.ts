"use client";

import { useEffect } from "react";

/**
 * Hook to register keyboard shortcuts
 * @param key - The key or key combination (e.g., "k", "cmd+k", "ctrl+k")
 * @param callback - Function to call when the shortcut is triggered
 * @param options - Options for the shortcut
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    preventDefault?: boolean;
  } = {}
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const {
        ctrlKey = false,
        metaKey = false,
        shiftKey = false,
        altKey = false,
        preventDefault = true,
      } = options;

      // Check if the modifier keys match
      const ctrlMatch = ctrlKey ? e.ctrlKey : !e.ctrlKey;
      const metaMatch = metaKey ? e.metaKey : !e.metaKey;
      const shiftMatch = shiftKey ? e.shiftKey : !e.shiftKey;
      const altMatch = altKey ? e.altKey : !e.altKey;

      // Check if the key matches
      const keyMatch = e.key.toLowerCase() === key.toLowerCase();

      if (ctrlMatch && metaMatch && shiftMatch && altMatch && keyMatch) {
        if (preventDefault) {
          e.preventDefault();
        }
        callback();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, options]);
}
