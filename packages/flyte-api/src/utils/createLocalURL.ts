import ensureSlashPrefixed from './ensureSlashPrefixed';

/** Creates a URL to the same host with a given path */
export default function createLocalURL(path: string) {
  return `${window.location.origin}${ensureSlashPrefixed(path)}`;
}
