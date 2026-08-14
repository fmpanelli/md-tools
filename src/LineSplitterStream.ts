import { Buffer } from "node:buffer";
import { Transform, TransformCallback } from "node:stream";

export type BufferSearchResult<T extends ArrayBufferLike> = {
  head: Buffer<T> | undefined;
  tail: Buffer<T>;
};

export function splitByLf<T extends ArrayBufferLike>(b: Buffer<T>): BufferSearchResult<T> {
  const LF = 0x0a; // \n
  const lfPos = b.indexOf(LF);
  if (lfPos >= 0) {
    return { head: b.subarray(0, lfPos + 1), tail: b.subarray(lfPos + 1) };
  }
  return { head: undefined, tail: b };
}

export class LineSplitterStream extends Transform {
  private _buffer: Buffer = Buffer.alloc(0);

  _transform(chunk: never, encoding: BufferEncoding, callback: TransformCallback): void {
    const currentChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding);
    this._buffer = Buffer.concat([this._buffer, currentChunk]);

    while (true) {
      const searchResult = splitByLf(this._buffer);
      if (searchResult.head === undefined) {
        break;
      }
      this.push(searchResult.head);
      this._buffer = searchResult.tail;
    }

    callback();
  }

  _flush(callback: TransformCallback): void {
    if (this._buffer.length > 0) {
      this.push(this._buffer);
    }
    callback();
  }
}
