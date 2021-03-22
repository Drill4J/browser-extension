export const parseURL = (value: string, prevValue: string) => {
  try {
    if (/(http(s?)):\/\//i.test(value)) return value;
    return `http://${new URL(value).host || value}`;
  } catch {
    const diffBetweenValues = prevValue.length - value.length;
    if (diffBetweenValues === 2) return value;
    return `http://${value}`;
  }
};
