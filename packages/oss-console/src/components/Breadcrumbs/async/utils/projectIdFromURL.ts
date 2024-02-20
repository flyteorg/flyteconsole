export const projectIdfromUrl = () => {
  const path = window.location.pathname.split('/');
  const projectIdIndex = path.indexOf('projects') + 1;
  return path[projectIdIndex];
};
