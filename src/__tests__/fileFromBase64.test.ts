import path from "path";
import fs from "fs/promises"; // For asynchronous file operations
import os from "os"; // For temporary directory creation
import { fileFromBase64 } from "../fileFromBase64";

const content64 = "aGVsbG8Kd29ybGQKCg==";

const content = "hello\nworld\n\n";
describe("fileFromBase64", () => {
  let tempTestDir: string;

  beforeAll(async () => {
    tempTestDir = await fs.mkdtemp(path.join(os.tmpdir(), "fileFromBase64-test-"));
  });

  afterAll(async () => {
    if (tempTestDir) {
      await fs.rm(tempTestDir, { recursive: true, force: true });
    }
  });

  test("writes a file with decoded base64 content", async () => {
    const testFilename = "output.txt";
    await fileFromBase64(tempTestDir, testFilename, content64);
    const filePath = path.join(tempTestDir, testFilename);
    await expect(fs.access(filePath)).resolves.toBeUndefined();

    // Assert: File content is correct
    const writtenContent = await fs.readFile(filePath, "utf8");
    const expectedContent = Buffer.from(content64, "base64").toString("utf8");
    expect(writtenContent).toBe(expectedContent);
    expect(writtenContent).toBe(content);
  });

  test("writes an empty file for empty base64 content", async () => {
    const testFilename = "empty_output.txt";
    const emptyContent64 = ""; // Base64 for an empty string
    await fileFromBase64(tempTestDir, testFilename, emptyContent64);

    const filePath = path.join(tempTestDir, testFilename);

    // Assert: File exists
    await expect(fs.access(filePath)).resolves.toBeUndefined();

    // Assert: File content is empty
    const writtenContent = await fs.readFile(filePath, "utf8");
    expect(writtenContent).toBe("");
  });
});
