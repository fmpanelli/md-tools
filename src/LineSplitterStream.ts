import { Buffer } from "buffer";
import { Transform } from "node:stream";

export type BufferSearchResult = {
  head: Buffer | undefined;
  tail: Buffer;
};

export function splitByLf(b: Buffer): BufferSearchResult {
  const LF = 0x0a; // \n
  const lfPos = b.indexOf(LF);
  if (lfPos >= 0) {
    return { head: b.subarray(0, lfPos + 1), tail: b.subarray(lfPos + 1) };
  }
  return { head: undefined, tail: b };
}

export const LineSplitterStream = () => {
  let _buffer = Buffer.alloc(0);
  let enc: BufferEncoding = "utf8";
  const eatchunk = (chunk: Buffer, t: Transform) => {
    _buffer = Buffer.concat([_buffer, chunk]);
    while (true) {
      const occ = splitByLf(_buffer);
      if (occ.head == undefined) break;
      _buffer = occ.tail;
      t.push(occ.head, enc);
    }
  };
  return new Transform({
    transform(chunk, encoding, callback) {
      enc = encoding;
      if (typeof chunk === "string") chunk = Buffer.from(chunk);
      eatchunk(chunk, this);
      callback();
    },
    flush(callback) {
      if (_buffer.length > 0) this.push(_buffer);
      callback();
    },
  });
};
