export function isExpired(expiresAt?: string | null) {
  if (!expiresAt) return false;
  return Date.now() >= new Date(expiresAt).getTime();
}
