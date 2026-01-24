export const cleanName = (name) => {
  if (name === null || name === undefined) return '';
  const str = String(name);
  const parts = str.split(':');
  if (parts.length > 1) {
    return parts[1].replace(/_/g, ' ');
  }
  return str.replace(/_/g, ' ');
};
