import fs from "fs/promises";
import path from "path";

/**
 * Decodes a base64 string and writes the resulting bytes to a file.
 * @param basePath - A parsed path object representing the target directory.
 * @param filename - The name of the file to create in the basePath.
 * @param content64 - The base64 encoded string content.
 */
export async function fileFromBase64(basePath: string, filename: string, content64: string): Promise<void> {
  const decodedBytes = Buffer.from(content64, "base64");
  const fullPath = path.join(basePath, filename);
  await fs.writeFile(fullPath, decodedBytes);
}
