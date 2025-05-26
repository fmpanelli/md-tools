import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { parseLine } from "./parseLine";
import { fileFromBase64 } from "./fileFromBase64";
import { replaceImageLinks } from "./replaceImageLinks";

/**
 * Reads the content of a source file line by line and writes it to a destination file.
 *
 * @param sourcePath The path to the source file.
 * @param destinationPath The path to the destination file.
 */
export async function extractPngsFromFile(sourcePath: string, destinationPath: string): Promise<void> {
  const absoluteSourcePath = path.resolve(sourcePath);
  const sourceFilename = path.basename(sourcePath);
  const absoluteDestinationPath = path.resolve(path.join(destinationPath, sourceFilename));
  const imageDestinationPath = path.join(destinationPath, "images");
  createFolderIfNotExists(imageDestinationPath);

  console.log(`Starting processing: ${absoluteSourcePath}`);
  console.log(`Streaming to: ${absoluteDestinationPath}`);

  const readableStream = fs.createReadStream(absoluteSourcePath, { encoding: "utf8" });
  const writableStream = fs.createWriteStream(absoluteDestinationPath, { encoding: "utf8" });
  const rl = readline.createInterface({
    input: readableStream,
    crlfDelay: Infinity, // Handles all \r\n instances as a single line break
  });

  return new Promise<void>((resolve, reject) => {
    let settled = false; // To ensure resolve/reject is called only once

    const handleError = (error: Error, origin: string) => {
      if (settled) return;
      settled = true;
      console.error(`Error during line-by-line copy (${origin}):`, error);
      if (rl) rl.close(); // This will also attempt to close the readableStream
      if (readableStream && !readableStream.destroyed) readableStream.destroy();
      if (writableStream && !writableStream.destroyed) writableStream.destroy();
      reject(error);
    };

    readableStream.on("error", (err) => handleError(err, "readable stream"));
    writableStream.on("error", (err) => handleError(err, "writable stream"));
    rl.on("error", (err) => handleError(err, "readline interface"));

    rl.on("line", (line) => {
      if (settled) return; // Stop processing if an error has occurred
      const parsed = parseLine(line);
      if (parsed._tag === "imageLine") {
        fileFromBase64(path.join(destinationPath, "images"), parsed.name + ".png", parsed.encodedImage);
      }
      if (parsed._tag === "plainLine") {
        const canWrite = writableStream.write(replaceImageLinks(line) + "\n");
        if (!canWrite) {
          readableStream.pause(); // Pausing readableStream also pauses readline
          writableStream.once("drain", () => {
            if (!settled) {
              readableStream.resume();
            }
          });
        }
      }
    });

    rl.on("close", () => {
      if (settled) return; // If an error occurred, reject was already called.

      // 'close' on readline means the input stream has ended.
      // End the writable stream to signal that no more data will be written.
      writableStream.end(() => {
        if (settled) return; // Check again in case of an error during end()/finish
        settled = true;
        console.log("File content copied successfully line-by-line!");
        resolve();
      });
    });
  });
}

/** create a folder if it does not exist */
export function createFolderIfNotExists(folderPath: string): void {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}
