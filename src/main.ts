import * as fs from 'fs'; // Changed for createReadStream/createWriteStream
import * as promisesFs from 'fs/promises'; // Kept for fs.access/writeFile in main
import * as path from 'path';
import * as readline from 'readline'; // Added for line-by-line processing

/**
 * Reads the content of a source file line by line and writes it to a destination file.
 *
 * @param sourcePath The path to the source file.
 * @param destinationPath The path to the destination file.
 */
async function copyFileContent(sourcePath: string, destinationPath: string): Promise<void> {
  const absoluteSourcePath = path.resolve(sourcePath);
  const absoluteDestinationPath = path.resolve(destinationPath);

  console.log(`Starting line-by-line copy from: ${absoluteSourcePath}`);
  console.log(`Streaming line-by-line to: ${absoluteDestinationPath}`);

  const readableStream = fs.createReadStream(absoluteSourcePath, { encoding: 'utf8' });
  const writableStream = fs.createWriteStream(absoluteDestinationPath, { encoding: 'utf8' });
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

      // Clean up: close readline interface and destroy streams
      if (rl) {
        rl.close(); // This will also attempt to close the readableStream
      }
      if (readableStream && !readableStream.destroyed) {
        readableStream.destroy();
      }
      if (writableStream && !writableStream.destroyed) {
        writableStream.destroy();
      }
      reject(error);
    };

    readableStream.on('error', (err) => handleError(err, 'readable stream'));
    writableStream.on('error', (err) => handleError(err, 'writable stream'));
    rl.on('error', (err) => handleError(err, 'readline interface'));

    rl.on('line', (line) => {
      if (settled) return; // Stop processing if an error has occurred

      // Write the line and add back the newline character.
      // Handle backpressure: if the writable stream's buffer is full, pause reading.
      const canWrite = writableStream.write(line + '\n');
      if (!canWrite) {
        readableStream.pause(); // Pausing readableStream also pauses readline
        writableStream.once('drain', () => {
          if (!settled) { // Only resume if no error occurred while paused
            readableStream.resume();
          }
        });
      }
    });

    rl.on('close', () => {
      if (settled) return; // If an error occurred, reject was already called.

      // 'close' on readline means the input stream has ended.
      // End the writable stream to signal that no more data will be written.
      writableStream.end(() => {
        if (settled) return; // Check again in case of an error during end()/finish
        settled = true;
        console.log('File content copied successfully line-by-line!');
        resolve();
      });
    });
  });
}

// --- Example Usage ---
async function main() {
  // Define your source and destination file paths
  // Make sure 'source.txt' exists in the same directory as your script,
  // or provide an absolute path.
  const sourceFile = 'source.txt';
  const destinationFile = 'destination.txt';

  // For demonstration, let's create a dummy source.txt if it doesn't exist
  try {
    await promisesFs.access(sourceFile);
  } catch {
    console.log(`Creating dummy ${sourceFile} for demonstration...`);
    await promisesFs.writeFile(sourceFile, 'Hello from the source file!\nThis is a test line by line.', 'utf8');
  }

  try {
    await copyFileContent(sourceFile, destinationFile);
  } catch (error) {
    // Error is already logged by copyFileContent's internal handlers,
    // but you might want to do additional cleanup or logging here.
    console.error('Failed to copy file content in main function.');
  }
}

// Run the example
main();
