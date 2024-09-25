import { evaluate } from "./evaluate";

describe("evaluate", () => {
  test.each([
    // ["", ""],
    // ['""', ""],
    // ["hello", ""],
    // ['"hello"', "hello"],
    // ['output "hello"', "hello"],
    // ["output 0", "0"],
    // ["output", ""],
    // ["output output", ""],
    // ["output output 0", "0"],
    // ["output input", "", { input: "" }],
    // ["output input", "hello", { input: "hello" }],
    // ["output input.foo", "bar", { input: JSON.stringify({ foo: "bar" }) }],
    // [
    //   "output input.foo.bar",
    //   "baz",
    //   { input: JSON.stringify({ foo: { bar: "baz" } }) },
    // ],
    // ["output input[0]", "foo", { input: JSON.stringify(["foo"]) }],
    ["output input[0][1]", "bar", { input: JSON.stringify([["foo", "bar"]]) }],
    // ["output input[input[1]]", "baz", { input: JSON.stringify(["baz", 0]) }],
  ])(
    "'%s' should return '%s'",
    async (
      knife: string,
      expected: string,
      context: { input: string } = { input: "" },
    ) => {
      const result = await evaluate(knife, context);
      expect(result).toStrictEqual(expected);
    },
  );
});
