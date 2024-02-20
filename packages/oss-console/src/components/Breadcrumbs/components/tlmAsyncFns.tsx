export const tlmAttemptSelfValue = (location: Location) => {
  const segments = location.pathname.split('/');
  const attemptIndex = segments.findIndex((segment) => segment === 'attempt');

  if (attemptIndex === -1) {
    return '';
  }

  const attempt = segments[attemptIndex + 1];
  return `${(parseInt(attempt || '0', 10) || 0) + 1}`.padStart(2, '0');
};
