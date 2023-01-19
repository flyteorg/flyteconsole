export const removeLeadingSlash = (pathName: string | null): string => {
  return pathName?.replace(/^\//, '') || '';
};
