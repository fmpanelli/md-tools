import { Transform } from "node:stream";
import { fileFromBase64 } from "./fileFromBase64";
import path from "node:path/posix";
import { parseLine } from "./parseLine";

/** Given a line of text, it replaces the occurrence of [imageN] links with (.[imageBasPath]/images/imageN) */
export function replaceImageLinks(text: string, imageBasePath: string): string {
  const regex = /!\[\]\[image(\d+)\]/g;
  return text.replaceAll(regex, (_, p1) => {
    return `![](${imageBasePath}/image${p1}.png)`;
  });
}


export const EmbeddedImageExtractor = (
  destinationPath: string,
  basePathResolution: "fromInsideDestinationFolder" | "fromOutideDestinationFolder"
) => {
  const destPath = destinationPath;
  return new Transform({
    async transform(chunk, encoding, callback) {
      const imagePath = path.join(destPath, "images");
      const basePath =
        basePathResolution === "fromInsideDestinationFolder" ? destPath : path.join(destPath, "..");
      const imageRelativePath = path.relative(basePath, imagePath).normalize();
      async function process(line: string) {
        const parsed = parseLine(line);
        switch (parsed._tag) {
          case "imageLine":
            await fileFromBase64(imagePath, parsed.name + ".png", parsed.encodedImage);
            return undefined;
          case "plainLine":
            return replaceImageLinks(chunk.toString(), imageRelativePath);
        }
      }
      process(chunk.toString()).then((s) => {
        if (s) this.push(s);
        callback();
      });
    },
  });
};
