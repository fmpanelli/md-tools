import { Buffer } from "buffer";
import { splitByLf } from "./bufferUtils";
import { Transform } from "node:stream";

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

