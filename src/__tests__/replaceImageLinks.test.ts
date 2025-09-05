import { replaceImageLinks } from "../EmbeddedImageExtractor";

describe("replaceImageLinks", () => {
  test("given a line with no ![][imageM] link, it is returned unchanged", () => {
    const line = "cdskfdk ![](./image1.png)   [image3] dfdsaf";
    expect(replaceImageLinks(line, "xxx")).toBe(line);
  });

  test.each([
    ["![][image1]", "![](test_path/image1.png)"],
    ["aascds ![][image2] cdscds", "aascds ![](test_path/image2.png) cdscds"],
    ["![][image2] ascds ![][image1]", "![](test_path/image2.png) ascds ![](test_path/image1.png)"],
  ])("given %s, it returns %s", (input, expected) => {
    const imagePath = "test_path";
    expect(replaceImageLinks(input, imagePath)).toBe(expected);
  });
});
