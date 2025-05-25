export type plainLine = {
  _tag: "plainLine";
  line: string;
};

export const PlainLine = {
  of(line: string): plainLine {
    return {
      _tag: "plainLine",
      line,
    };
  },
};

export type imageLine = {
  _tag: "imageLine";
  name: string;
  encodedImage: string;
};

export const ImageLine = {
  of(name: string, encodedImage: string): imageLine {
    return {
      _tag: "imageLine",
      name,
      encodedImage,
    };
  },
};

export function parseLine(input: string) {
  const re = new RegExp(/\[(.*)\]:\s*<data:image\/png;base64,(.*)>/);
  const matches = re.exec(input);
  if (matches) {
    return ImageLine.of(matches[1], matches[2]);
  }
  return PlainLine.of(input);
}
