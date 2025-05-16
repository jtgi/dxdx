import { useEffect } from "react";

type KeyCombo = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
};

type KeyboardShortcutOptions = {
  keys: KeyCombo | KeyCombo[];
  action: () => void;
  preventDefault?: boolean;
};

export function useKeyboardShortcut({ keys, action, preventDefault = true }: KeyboardShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyCombos = Array.isArray(keys) ? keys : [keys];

      const isMatch = keyCombos.some(
        ({ key, ctrlKey, metaKey, altKey, shiftKey }) =>
          e.key === key &&
          (ctrlKey === undefined || e.ctrlKey === ctrlKey) &&
          (metaKey === undefined || e.metaKey === metaKey) &&
          (altKey === undefined || e.altKey === altKey) &&
          (shiftKey === undefined || e.shiftKey === shiftKey)
      );

      if (isMatch) {
        if (preventDefault) {
          e.preventDefault();
        }
        action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keys, action, preventDefault]);
}
