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
    const testFilePath = "testdata/test-file-no-image-lf.md";
    const testFilename = "test-file-no-image-lf.md";
    await extractPngsFromFile(testFilePath, tempTestDir);
    const filePath = path.join(tempTestDir, testFilename);
    await expect(fs.access(filePath)).resolves.toBeUndefined();

    // // Assert: File content is correct
    const inputContent = await fs.readFile(testFilePath, "utf8");
    const writtenContent = await fs.readFile(filePath, "utf8");
    expect(writtenContent).toEqual(inputContent);
  });

  test("crlf are preserved", async () => {
    const testFilePath = "testdata/test-file-no-image-crlf.md";
    const testFilename = "test-file-no-image-crlf.md";
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

  test("given an input file with images in the same folder as the target folder, it does nothing and returns an error", async () => {
    const folder = path.join(tempTestDir, "same-folder-test");
    await fs.mkdir(folder);
    const testFilePath = path.join(folder, "test-file-with-images.md");
    const originalFilePath = "testdata/test-file-with-images.md";
    await fs.copyFile(originalFilePath, testFilePath);
    await expect(extractPngsFromFile(testFilePath, folder)).rejects.toMatchObject({});
    expect(await fs.readFile(testFilePath, "utf8")).toEqual(await fs.readFile(originalFilePath, "utf8"));
  });
});
