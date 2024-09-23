import { evaluate } from "./evaluate";

describe("evaluate", () => {
  test.each([
    ["", ""],
    ["hello", "hello"],
    ['output "hello"', "hello"],
    ["output 0", "0"],
  ])("'%s' should return '%s'", async (knife: string, expected: string) => {
    const result = await evaluate(knife);
    expect(result).toStrictEqual(expected);
  });
});
