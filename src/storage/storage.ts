export function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLS<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function hasLS(key: string) {
  return localStorage.getItem(key) !== null;
}

export function makeId() {
  // Safe fallback that works everywhere (no TS/crypto typing issues)
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}