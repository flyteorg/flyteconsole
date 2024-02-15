export const removeLeadingSlash = (pathName: string | null): string => {
  return pathName?.replace(/^\//, '') || '';
};

export const getColorFromString = (str: string) => {
  const strToDec = (string: string) => {
    return (
      Array.from<string>(string)
        .map(c => c.codePointAt(0) || 0)
        .reduce((sum, char, i) => sum + ((i + 1) * char) / 256, 0) % 1
    );
  };
  return (
    'hsl(' +
    360 * strToDec(str) +
    ',' +
    (40 + 60 * strToDec(str)) +
    '%,' +
    (75 + 10 * strToDec(str)) +
    '%)'
  );
};
