import path from "node:path/posix";
import fs from "fs/promises"; // For asynchronous file operations
import os from "os"; // For temporary directory creation
import { extractPngsFromFile } from "../extractPngsFromFile";

describe("extractPngsFromFile", () => {
  const tempTestDirs: string[] = [];

  const getTempTestDir = async () => {
    const tempTestDir = await fs.mkdtemp(path.join(os.tmpdir(), "extractPngsFromFile-test-"));
    tempTestDirs.push(tempTestDir);
    return tempTestDir;
  };

  afterAll(async () => {
    tempTestDirs.forEach(async (tempTestDir) => await fs.rm(tempTestDir, { recursive: true, force: true }));
  });

  test("given an input file with no images, it just copies the file", async () => {
    const tempTestDir = await getTempTestDir();
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
    const tempTestDir = await getTempTestDir();
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
    const tempTestDir = await getTempTestDir();
    const testFilePath = "testdata/test-file-with-images.md";
    const expectedFilePath = "testdata/expected-results/expected-file-with-image-removed.md";
    const testFilename = "test-file-with-images.md";
    await extractPngsFromFile(testFilePath, tempTestDir);
    const filePath = path.join(tempTestDir, testFilename);
    const expectedContent = await fs.readFile(expectedFilePath, "utf8");
    const writtenContent = await fs.readFile(filePath, "utf8");
    expect(writtenContent).toEqual(expectedContent);
  });

  test("given an input file with images, when using 'from' it copies the file stripping the images", async () => {
    const testSubFolder = "testsubfolder";
    const tempTestDir = path.join(await getTempTestDir(), testSubFolder);
    const testFilePath = "testdata/test-file-with-images.md";
    const testFilename = "test-file-with-images.md";
    await extractPngsFromFile(testFilePath, tempTestDir, "fromOutideDestinationFolder");
    const filePath = path.join(tempTestDir, testFilename);
    const expectedContent =
      `Test file\n` +
      `\n` +
      "An image:  \n" +
      `![](${testSubFolder}/images/image1.png)  \n` +
      "Another image:  \n" +
      `![](${testSubFolder}/images/image2.png)\n` +
      "\n" +
      "See ya\\!  " +
      "\n" +
      "\n" +
      "\n" +
      "\n";
    const writtenContent = await fs.readFile(filePath, "utf8");
    expect(writtenContent).toEqual(expectedContent);
  });

  test("given an input file with images, it it creates files with the images", async () => {
    const tempTestDir = await getTempTestDir();
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
    const tempTestDir = await getTempTestDir();
    const testFilePath = path.join(tempTestDir, "test-file-with-images.md");
    const originalFilePath = "testdata/test-file-with-images.md";
    await fs.copyFile(originalFilePath, testFilePath);
    await expect(extractPngsFromFile(testFilePath, tempTestDir)).rejects.toMatchObject({});
    expect(await fs.readFile(testFilePath, "utf8")).toEqual(await fs.readFile(originalFilePath, "utf8"));
  });
});
