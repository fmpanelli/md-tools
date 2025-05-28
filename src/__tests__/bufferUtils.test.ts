import { BufferSearchResult, findCrLf, splitByLf } from "../bufferUtils";

describe("findCrLf", () => {
  test.each([
    ["", -1],
    ["a", -1],
    ["ab\r", -1],
    ["ab\r\n", 2],
    ["ab\r\nab\r\n", 2],
    ["\r\n", 0],
    ["\n\r\n", 1],
    ["ab\r\r\n", 3],
  ])('when called with "%s" it returns %d', (input: string, expected: number) => {
    expect(findCrLf(Buffer.from(input))).toBe(expected);
  });
});

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

