import * as fs from "fs";
import * as path from "path";
import { LineSplitterStream } from "./LineSplitterStream";
import { EmbeddedImageExtractor } from "./EmbeddedImageExtractor";
import { pipeline } from "node:stream";

/**
 * Reads the content of a source file line by line and writes it to a destination file.
 *
 * @param sourcePath The path to the source file.
 * @param destinationPath The path to the destination file.
 */
export function extractPngsFromFile(
  sourcePath: string,
  destinationPath: string,
  basePathResolution:
    | "fromInsideDestinationFolder"
    | "fromOutideDestinationFolder" = "fromInsideDestinationFolder"
): Promise<NodeJS.ErrnoException | string> {
  const absoluteSourcePath = path.resolve(sourcePath);
  const absoluteDestinationPath = path.resolve(path.join(destinationPath, path.basename(sourcePath)));
  const imageDestinationPath = path.join(destinationPath, "images");
  console.debug(`Source path:      ${absoluteSourcePath}`);
  console.debug(`Destination path: ${absoluteDestinationPath}`);
  if (absoluteSourcePath === absoluteDestinationPath) {
    return new Promise((__dirname, reject) => {
      reject(new Error("Source and destination paths cannot be the same"));
    });
  }
  createFolderIfNotExists(imageDestinationPath);

  console.log(`Starting processing: ${absoluteSourcePath}`);
  console.log(`Streaming to: ${absoluteDestinationPath}`);

  const readableStream = fs.createReadStream(absoluteSourcePath, { encoding: "utf8" });
  const writableStream = fs.createWriteStream(absoluteDestinationPath, { encoding: "utf8" });
  const rl = LineSplitterStream();
  const pl = EmbeddedImageExtractor(destinationPath, basePathResolution);

  return new Promise((resolve, reject) => {
    pipeline(readableStream, rl, pl, writableStream, (err) => {
      if (err) {
        reject(err);
      } else resolve(`Processed ${path.basename(sourcePath)}`);
    });
  });
}

/** create a folder if it does not exist */
export function createFolderIfNotExists(folderPath: string): void {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}
