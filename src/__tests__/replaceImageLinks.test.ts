import { replaceImageLinks } from "../replaceImageLinks";

describe("replaceImageLinks", () => {
  test("given a line with no ![][imageM] link, it is returned unchanged", () => {
    const line = "cdskfdk ![](./image1.png)   [image3] dfdsaf";
    expect(replaceImageLinks(line)).toBe(line);
  });

  test.each([
    ["![][image1]", "![](./images/image1.png)"],
    ["aascds ![][image2] cdscds", "aascds ![](./images/image2.png) cdscds"],
    ["![][image2] ascds ![][image1]", "![](./images/image2.png) ascds ![](./images/image1.png)"],
  ])("given %s, it returns %s", (input, expected) => {
    expect(replaceImageLinks(input)).toBe(expected);
  });
});
