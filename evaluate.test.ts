import { evaluate } from "./evaluate";

describe("evaluate", () => {
  test.each([
    ["", ""],
    ['""', ""],
    ["hello", ""],
    ['"hello"', "hello"],
    ['output "hello"', "hello"],
    ["output 0", "0"],
    ["output", ""],
    ["output output", ""],
    ["output output 0", "0"],
    [
      `output ${JSON.stringify({ foo: "bar" })}`,
      JSON.stringify({ foo: "bar" }),
    ],
    [
      `output ${JSON.stringify(["foo", "bar"])}`,
      JSON.stringify(["foo", "bar"]),
    ],
    ["output input", "", { input: "" }],
    ["output input", "hello", { input: "hello" }],
    ["output input.foo", "bar", { input: JSON.stringify({ foo: "bar" }) }],
    [
      "output input.foo.bar",
      "baz",
      { input: JSON.stringify({ foo: { bar: "baz" } }) },
    ],
    ["output input[0]", "foo", { input: JSON.stringify(["foo"]) }],
    ["output input[0][1]", "bar", { input: JSON.stringify([["foo", "bar"]]) }],
    ["output input[input[1]]", "baz", { input: JSON.stringify(["baz", 0]) }],
    [
      "output input[input[1][0]][2]",
      "baz",
      { input: JSON.stringify([0, [2], ["foo", "bar", "baz"]]) },
    ],
    ["output input[0].foo", "bar", { input: JSON.stringify([{ foo: "bar" }]) }],
    [
      "output input[0].foo[0]",
      "b",
      { input: JSON.stringify([{ foo: ["b"] }]) },
    ],
    [`set foo to "bar"`, ""],
    [
      `set foo to "bar"
    output foo`,
      "bar",
    ],
    [
      `set foo to "bar"
    output baz`,
      "",
    ],
    [
      `set baz to ["foo", "bar"]
    output baz[0]`,
      "foo",
    ],
    [
      `set qux to { foo: "bar" }
    output qux.foo`,
      "bar",
    ],
    [
      `set foo to {
      bar: "baz"
    }
    output foo.bar`,
      "baz",
    ],
    [
      `set foo to {
      bar: "baz"
    }

    output foo.bar`,
      "baz",
    ],
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
