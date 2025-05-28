import { BufferSearchResult,  splitByLf } from "../bufferUtils";

describe("splitByLf", () => {
  test.each([
    ["", {head:undefined, tail:Buffer.from("")}],
    ["a", {head:undefined, tail:Buffer.from("a")}],
    ["ab", {head:undefined, tail:Buffer.from("ab")}],
    ["ab\r\n", {head:Buffer.from("ab\r\n"), tail:Buffer.from("")}],
    ["ab\r\ncd\r\n", {head:Buffer.from("ab\r\n"), tail:Buffer.from("cd\r\n")}],
    ["\r\n", {head:Buffer.from("\r\n"), tail:Buffer.from("")}],
    ["\n\r\n", {head:Buffer.from("\n"), tail:Buffer.from("\r\n")}],
    ["ab\r\r\n", {head:Buffer.from("ab\r\r\n"), tail:Buffer.from("")}],
  ])('when called with "%s" it returns %o', (input: string, expected: BufferSearchResult) => {
    expect(splitByLf(Buffer.from(input))).toEqual(expected);
  });
});

