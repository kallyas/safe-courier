const STORAGE_KEY = "safe_courier_token";

/** Single place that owns the persisted JWT. */
export const tokenStore = {
  get(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  },
  set(token: string): void {
    localStorage.setItem(STORAGE_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};

/** Fired when an authenticated request is rejected as unauthorized. */
export const UNAUTHORIZED_EVENT = "safe-courier:unauthorized";
