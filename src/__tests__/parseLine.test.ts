import { ImageLine, PlainLine, parseLine } from "../parseLine";

test.each([
  "hello world",
  "[image1]: abcd",
  "[image1]: <data:text/html;base64,abcd>",
  "[image1]: <data:image/bmp;base64,abcd>",
])("when passing %s then it retrurns it as a `plainLine`", (line: string) => {
  expect(parseLine(line)).toStrictEqual(PlainLine.of(line));
});

test.each([
  ["[image1]: <data:image/png;base64,abcd>", "image1", "abcd"],
  ["    [image1]: <data:image/png;base64,abcd>   ", "image1", "abcd"],
  ["[image1]:   <data:image/png;base64,abcd>", "image1", "abcd"],
])(
  "when passing %s then it retrurns it as a `imageLine` with name %s and encodedImage %s",
  (line: string, name: string, encodedImage: string) => {
    expect(parseLine(line)).toStrictEqual(ImageLine.of(name, encodedImage));
  }
);
