export function objectPropsToArray<T>(obj: Record<string, T>): T[] {
  if (!obj) return [];
  const keys = Object.keys(obj);
  return keys.map((x) => obj[x]);
}
