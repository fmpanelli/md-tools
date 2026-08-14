import { Buffer } from "node:buffer";
import { Transform, TransformCallback } from "node:stream";

export type FirstLineAndRest<T extends ArrayBufferLike> = {
  firstLine: Buffer<T> | undefined;
  rest: Buffer<T>;
};

export function getNextLine<T extends ArrayBufferLike>(b: Buffer<T>): FirstLineAndRest<T> {
  const LF = 0x0a; // \n
  const lfPos = b.indexOf(LF);
  if (lfPos >= 0) {
    return { firstLine: b.subarray(0, lfPos + 1), rest: b.subarray(lfPos + 1) };
  }
  return { firstLine: undefined, rest: b };
}

export class LineSplitterStream extends Transform {
  private _buffer: Buffer = Buffer.alloc(0);

  private appendToBuffer(chunk: never, encoding: BufferEncoding) {
    const currentChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding);
    this._buffer = Buffer.concat([this._buffer, currentChunk]);
  }

  /** Sends a line downstream and removes it from the _buffer */
  private outputLine(firstLineAndRest: FirstLineAndRest<ArrayBufferLike>) {
    this.push(firstLineAndRest.firstLine);
    this._buffer = firstLineAndRest.rest;
  }
  _transform(chunk: never, encoding: BufferEncoding, callback: TransformCallback): void {
    this.appendToBuffer(chunk, encoding);
    while (true) {
      const firstLineAndRest = getNextLine(this._buffer);
      if (firstLineAndRest.firstLine === undefined) break;
      this.outputLine(firstLineAndRest);
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
