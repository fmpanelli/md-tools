// Define byte codes for common line endings
const LF = 0x0a; // \n
const CR = 0x0d; // \r

export type BufferSearchResult = {
  head: Buffer | undefined;
  tail: Buffer;
};

export function splitByCrLf(b: Buffer): BufferSearchResult {
  const crlfPos = findCrLf(b);
  if (crlfPos >= 0) {
    return { head: b.subarray(0, crlfPos+2), tail: b.subarray(crlfPos + 2) };
  }
  return { head: undefined, tail: b };
}

export function findCrLf(b: Buffer): number {
  let start = 0;
  while (start < b.length) {
    const crPos = b.indexOf(CR, start);
    if (crPos === -1) {
      break;
    }
    if (b[crPos + 1] === LF) return crPos;

    start = crPos + 1;
  }
  return -1;
}

export function splitByLf(b: Buffer): BufferSearchResult {
  const crlfPos = b.indexOf(LF)
  if (crlfPos >= 0) {
    return { head: b.subarray(0, crlfPos+1), tail: b.subarray(crlfPos + 1) };
  }
  return { head: undefined, tail: b };
}

