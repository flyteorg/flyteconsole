/** Ensures that a string is slash-prefixed */
export default function ensureSlashPrefixed(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}
