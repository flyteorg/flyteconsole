export const domainIdfromUrl = (location: Location) => {
  const path = location.pathname.split('/');
  if (path.indexOf('domains') > -1) {
    return path[path.indexOf('domains') + 1] || '';
  }
  if (location.search.includes('domain')) {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('domain') || '';
  }

  return '';
};
