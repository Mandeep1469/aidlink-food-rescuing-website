import { useLocalStorage } from "./useLocalStorage.js";

/**
 * useAuth — reads/writes the logged-in AidLink user from localStorage.
 * Any component that calls this hook stays in sync with login/logout state.
 */
export function useAuth() {
  const [user, setUser, clearUser] = useLocalStorage("aidlink_user", null);

  const login = (userData) => setUser(userData);
  const logout = () => clearUser();

  return { user, isAuthenticated: !!user, login, logout };
}
