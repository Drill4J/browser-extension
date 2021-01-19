export function transformHost(targetHost: string | undefined): string {
  if (!targetHost) return '';
  try {
    const url = new URL(targetHost);
    const { protocol, host } = url;
    return `${protocol}//${host}`;
  } catch {
    // TODO returning '' may mask errors
    return '';
  }
}
