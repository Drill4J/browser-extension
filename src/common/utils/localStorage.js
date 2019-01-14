export function getStorageItem(key) {
  return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null;
}
export function setStorageItem(key, value) {
  return localStorage.setItem(key, JSON.stringify(value));
}
