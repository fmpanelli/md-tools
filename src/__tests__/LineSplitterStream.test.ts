import { FirstLineAndRest, getFirstLine } from "../LineSplitterStream";

describe("getFirstLine", () => {
  test.each([
    ["", { firstLine: undefined, rest: Buffer.from("") }],
    ["a", { firstLine: undefined, rest: Buffer.from("a") }],
    ["ab", { firstLine: undefined, rest: Buffer.from("ab") }],
    ["ab\r\n", { firstLine: Buffer.from("ab\r\n"), rest: Buffer.from("") }],
    ["ab\r\ncd\r\n", { firstLine: Buffer.from("ab\r\n"), rest: Buffer.from("cd\r\n") }],
    ["\r\n", { firstLine: Buffer.from("\r\n"), rest: Buffer.from("") }],
    ["\n\r\n", { firstLine: Buffer.from("\n"), rest: Buffer.from("\r\n") }],
    ["ab\r\r\n", { firstLine: Buffer.from("ab\r\r\n"), rest: Buffer.from("") }],
  ])('when called with "%s" it returns %o', <T extends ArrayBufferLike>(input: string, expected: FirstLineAndRest<T>) => {
    expect(getFirstLine(Buffer.from(input))).toEqual(expected);
  });

});
