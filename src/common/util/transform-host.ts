export function transformHost(targetHost: string | undefined) {
  if (!targetHost) return '';
  const url = new URL(targetHost);
  const { protocol, host } = url;
  return `${protocol}//${host}`;
}
