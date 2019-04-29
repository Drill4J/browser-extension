export function getStorageItem(key: string) {
  return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null;
}
export function setStorageItem(key: string, value: any) {
  return localStorage.setItem(key, JSON.stringify(value));
}
