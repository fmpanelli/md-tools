import path from "path";
import fs from "fs/promises"; // For asynchronous file operations
import os from "os"; // For temporary directory creation
import { extractPngsFromFile } from "../processFile";

describe("extractPngsFromFile", () => {
  let tempTestDir: string;

  beforeAll(async () => {
    tempTestDir = await fs.mkdtemp(path.join(os.tmpdir(), "extractPngsFromFile-test-"));
  });

  afterAll(async () => {
    if (tempTestDir) {
      await fs.rm(tempTestDir, { recursive: true, force: true });
    }
  });

  test("given an input file with no images, it just copies the file", async () => {
    const testFilePath = "testdata/test-file-no-image.md";
    const testFilename = "test-file-no-image.md";
    await extractPngsFromFile(testFilePath, tempTestDir);
    const filePath = path.join(tempTestDir, testFilename);
    await expect(fs.access(filePath)).resolves.toBeUndefined();

    // // Assert: File content is correct
    const inputContent = await fs.readFile(testFilePath, "utf8");
    const writtenContent = await fs.readFile(filePath, "utf8");
    expect(writtenContent).toEqual(inputContent);
  });

  test("given an input file with images, it copies the file stripping the images", async () => {
    const testFilePath = "testdata/test-file-with-images.md";
    const expectedFilePath = "testdata/expected-results/expected-file-with-image-removed.md";
    const testFilename = "test-file-with-images.md";
    await extractPngsFromFile(testFilePath, tempTestDir);
    const filePath = path.join(tempTestDir, testFilename);
    const expectedContent = await fs.readFile(expectedFilePath, "utf8");
    const writtenContent = await fs.readFile(filePath, "utf8");
    expect(writtenContent).toEqual(expectedContent);
  });

  test("given an input file with images, it it creates files with the images", async () => {
    const testFilePath = "testdata/test-file-with-images.md";
    await extractPngsFromFile(testFilePath, tempTestDir);
    ["image1.png", "image2.png"].forEach(async (filename) => {
      const expectedFilePath = `testdata/expected-results/images/${filename}`;
      const expectedContent = await fs.readFile(expectedFilePath, "utf8");
      const filePath = path.join(tempTestDir, "images", filename);
      expect(await fs.readFile(filePath, "utf8")).toEqual(expectedContent);
    });
  });
});
