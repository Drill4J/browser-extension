import xxHashJs from 'xxhashjs';

export function getHash(str: string) {
  const seed = 0xabcd;
  const hashFn = xxHashJs.h32(seed);
  return hashFn.update(str).digest().toString(16);
}
