// Define byte codes for common line endings
const LF = 0x0a; // \n

export type BufferSearchResult = {
  head: Buffer | undefined;
  tail: Buffer;
};

export function splitByLf(b: Buffer): BufferSearchResult {
  const crlfPos = b.indexOf(LF)
  if (crlfPos >= 0) {
    return { head: b.subarray(0, crlfPos+1), tail: b.subarray(crlfPos + 1) };
  }
  return { head: undefined, tail: b };
}

