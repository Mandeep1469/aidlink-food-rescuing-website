const STORAGE_KEY = "aidlink_accounts";
const ROLE_PREFIX = { citizen: "C", ngo: "N", restaurant: "R" };

function getAccounts() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAccounts(accounts) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // storage unavailable — fail silently
  }
}

/** Next sequential ID for a role, based on how many accounts of that role already exist. */
export function generateNextId(role) {
  const prefix = ROLE_PREFIX[role] || "U";
  const countForRole = getAccounts().filter((a) => a.id.startsWith(prefix)).length;
  return prefix + String(countForRole + 1).padStart(3, "0");
}

export function registerAccount({ id, fullName, email, password, role, restaurant }) {
  const accounts = getAccounts();
  const account = { id, fullName, email, password, role };
  // restaurants also save { name, location, foodType, lat, lng } so they can be shown on the map
  if (restaurant) account.restaurant = restaurant;
  accounts.push(account);
  saveAccounts(accounts);
}

/** Public details of every registered restaurant — never includes email or password. */
export function getRestaurantAccounts() {
  return getAccounts()
    .filter((a) => a.role === "restaurant" && a.restaurant && a.restaurant.name)
    .map((a) => ({ id: a.id, ...a.restaurant }));
}

/** Finds a registered account by AidLink ID or email (case-insensitive). */
export function findAccount(idOrEmail) {
  const needle = idOrEmail.trim().toLowerCase();
  return getAccounts().find(
    (a) => a.id.toLowerCase() === needle || a.email.toLowerCase() === needle
  );
}
