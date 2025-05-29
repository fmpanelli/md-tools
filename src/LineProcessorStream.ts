import { Transform } from "node:stream";
import { fileFromBase64 } from "./fileFromBase64";
import path from "node:path";
import { parseLine } from "./parseLine";
import { replaceImageLinks } from "./replaceImageLinks";

export const LineProcessorStream = (destinationPath: string) => {
  const destPath = destinationPath;
  return new Transform({
    async transform(chunk, encoding, callback) {
      async function process(line: string) {
        const parsed = parseLine(line);
        switch (parsed._tag) {
          case "imageLine":
            await fileFromBase64(path.join(destPath, "images"), parsed.name + ".png", parsed.encodedImage);
            return undefined;
          case "plainLine":
            return replaceImageLinks(chunk.toString());
        }
      }
      console.log(chunk.toString);
      process(chunk.toString()).then((s) => {
        if (s) this.push(s);
        callback();
      });
    },
  });
};
