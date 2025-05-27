import * as stream from "node:stream";
import { EventEmitter, Transform, TransformCallback } from "stream";
import { Buffer } from "buffer";
import { splitByLf } from "./bufferUtils";
import { ReadStream } from "node:fs";

// Define byte codes for common line endings
const LF = 0x0a; // \n
const CR = 0x0d; // \r

export class LineSplitterStream extends EventEmitter {
  private _buffer: Buffer;
  inputStream: ReadStream;

  constructor(inputStream: ReadStream) {
    super();
    this.inputStream = inputStream;
    this._buffer = Buffer.alloc(0); // Initialize an empty buffer
    inputStream.on("data", (chunk: string | Buffer) => {
      if (typeof chunk === "string") chunk = Buffer.from(chunk);
      this.eatchunk(chunk);
    });
    inputStream.on("end", () => {
      this.emit("line", this._buffer);
      this.emit("close");
    });
  }

  private eatchunk(chunk: Buffer) {
    this._buffer = Buffer.concat([this._buffer, chunk]);
    while (true) {
      const occ = splitByLf(this._buffer);
      if (occ.head == undefined) break;
      this._buffer = occ.tail;
      this.emit("line", occ.head);
    }
  }

  close() {
    if (this.inputStream && !this.inputStream.destroyed) this.inputStream.destroy();
  }
}
