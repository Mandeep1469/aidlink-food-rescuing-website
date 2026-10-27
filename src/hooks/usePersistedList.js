import { useLocalStorage } from "./useLocalStorage.js";

/**
 * usePersistedList — an array persisted to localStorage under `key`,
 * with an addItem helper that prepends a new entry (so newest shows first).
 */
export function usePersistedList(key) {
  const [items, setItems] = useLocalStorage(key, []);

  const addItem = (item) => {
    setItems((prev) => [item, ...prev]);
  };

  return [items, addItem];
}
