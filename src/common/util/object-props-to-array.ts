export function objectPropsToArray<T>(obj: Record<string, T>): T[] {
  const keys = Object.keys(obj);
  return keys.map((x) => obj[x]);
}
