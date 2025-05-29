import * as fs from "fs";
import * as path from "path";
import { LineSplitterStream } from "./LineSplitterStream";
import { LineProcessorStream } from "./LineProcessorStream";
import { pipeline } from "node:stream";

/**
 * Reads the content of a source file line by line and writes it to a destination file.
 *
 * @param sourcePath The path to the source file.
 * @param destinationPath The path to the destination file.
 */
export function extractPngsFromFile(sourcePath: string, destinationPath: string): Promise<NodeJS.ErrnoException | string> {
  const absoluteSourcePath = path.resolve(sourcePath);
  const sourceFilename = path.basename(sourcePath);
  const absoluteDestinationPath = path.resolve(path.join(destinationPath, sourceFilename));
  const imageDestinationPath = path.join(destinationPath, "images");
  createFolderIfNotExists(imageDestinationPath);

  console.log(`Starting processing: ${absoluteSourcePath}`);
  console.log(`Streaming to: ${absoluteDestinationPath}`);

  const readableStream = fs.createReadStream(absoluteSourcePath, { encoding: "utf8" });
  const writableStream = fs.createWriteStream(absoluteDestinationPath, { encoding: "utf8" });
  const rl = LineSplitterStream();
  const pl = LineProcessorStream(destinationPath);

  return new Promise((resolve, reject) => {
    pipeline(readableStream, rl, pl, writableStream, (err) => {
      if (err) {
        reject(err);
      } else resolve(`Processed ${sourceFilename}`);
    });
  });
}

/** create a folder if it does not exist */
export function createFolderIfNotExists(folderPath: string): void {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}
