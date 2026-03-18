export const cacheStore = new Map();

export function getCache(key) {
  const item = cacheStore.get(key);

  if (!item) return null;

  if (Date.now() > item.expiry) {
    cacheStore.delete(key);
    return null;
  }

  return item.value;
}

export function setCache(key, value, ttl = 60000) {
  cacheStore.set(key, {
    value,
    expiry: Date.now() + ttl,
  });
}
