const requests = new Map();

export function rateLimiter(ip, limit = 1000, windowMs = 60000) {
  const now = Date.now();

  if (!requests.has(ip)) {
    requests.set(ip, []);
  }

  const timestamps = requests.get(ip);

  const validRequests = timestamps.filter(
    (timestamp) => now - timestamp < windowMs,
  );

  validRequests.push(now);

  requests.set(ip, validRequests);

  if (validRequests.length > limit) {
    return false;
  }

  return true;
}
