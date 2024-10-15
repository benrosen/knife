import { evaluate } from "./evaluate";
import { Context } from "./types";

describe("evaluate", () => {
  const testCases: (
    | [
        Parameters<typeof evaluate>[0],
        Awaited<ReturnType<typeof evaluate>>["value"],
        Context,
      ]
    | [
        Parameters<typeof evaluate>[0],
        Awaited<ReturnType<typeof evaluate>>["value"],
      ]
  )[] = [
    ["", ""],
    ['""', ""],
    ["hello", ""],
    ['"hello"', "hello"],
    ['output "hello"', "hello"],
    [`output hello`, ""],
    ["output 0", "0"],
    [`output "0"`, "0"],
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
    ["output input", "", { input: "", state: {} }],
    ["output input", "hello", { input: "hello", state: {} }],
    [
      "output input.foo",
      "bar",
      { input: JSON.stringify({ foo: "bar" }), state: {} },
    ],
    [
      "output input.foo.bar",
      "baz",
      { input: JSON.stringify({ foo: { bar: "baz" } }), state: {} },
    ],
    ["output input[0]", "foo", { input: JSON.stringify(["foo"]), state: {} }],
    [
      "output input[0][1]",
      "bar",
      { input: JSON.stringify([["foo", "bar"]]), state: {} },
    ],
    [
      "output input[input[1]]",
      "baz",
      { input: JSON.stringify(["baz", 0]), state: {} },
    ],
    [
      "output input[input[1][0]][2]",
      "baz",
      { input: JSON.stringify([0, [2], ["foo", "bar", "baz"]]), state: {} },
    ],
    [
      "output input[0].foo",
      "bar",
      { input: JSON.stringify([{ foo: "bar" }]), state: {} },
    ],
    [
      "output input[0].foo[0]",
      "b",
      { input: JSON.stringify([{ foo: ["b"] }]), state: {} },
    ],
    [
      `output ["foo", "bar", "baz"]`,
      JSON.stringify(["foo", "bar", "baz"]),
      { input: "", state: {} },
    ],
    [
      `
output [
  "foo",
  "bar",
  "baz"
]
`,
      JSON.stringify(["foo", "bar", "baz"]),
      { input: "", state: {} },
    ],
    [
      `
output [
  0,
  1,
  2
]
`,
      JSON.stringify([0, 1, 2]),
      { input: "", state: {} },
    ],
    [
      `
output [
  0,
  input
]
`,
      JSON.stringify([0, "hello"]),
      { input: "hello", state: {} },
    ],
    [
      `
output {
  "foo": "bar"
}
`,
      JSON.stringify({ foo: "bar" }),
      { input: "", state: {} },
    ],
    [
      `
output {
  "foo": "bar",
  "baz": "qux"
}
`,
      JSON.stringify({ foo: "bar", baz: "qux" }),
      { input: "", state: {} },
    ],
    [
      `
output {
  "foo": 1,
  "bar": [1, 2, 3],
}
`,
      JSON.stringify({ foo: 1, bar: [1, 2, 3] }),
      { input: "", state: {} },
    ],
    [
      `
output {
  "foo": input,
  "bar": [1, 2, 3],
}
`,
      JSON.stringify({ foo: 1, bar: [1, 2, 3] }),
      { input: JSON.stringify(1), state: {} },
    ],
    [
      `
output {
  "foo": input.foo,
  "bar": [1, 2, 3],
}
`,
      JSON.stringify({ foo: { baz: "qux" }, bar: [1, 2, 3] }),
      {
        input: JSON.stringify({
          foo: {
            baz: "qux",
          },
        }),
        state: {},
      },
    ],
    [`output foo`, "", { input: "", state: {} }],
    [`output foo`, "bar", { input: "", state: { foo: "bar" } }],
    [
      `output foo[0]`,
      "bar",
      { input: "", state: { foo: JSON.stringify(["bar"]) } },
    ],
    [`output foo`, "baz", { input: "", state: { foo: "baz" } }],
    [
      `output [foo, input]`,
      JSON.stringify([0, "hello"]),
      { input: "hello", state: { foo: "0" } },
    ],
    [`set foo to "bar"`, ""],
    [
      `
set foo to "bar"
output foo
`,
      "bar",
      { input: "", state: {} },
    ],
    [
      `
set foo to "bar"
          
output foo
`,
      "bar",
      { input: "", state: {} },
    ],
    [
      `
set foo to "bar"
output baz
`,
      "",
    ],
    [
      `
set baz to ["foo", "bar"]
output baz[0]
`,
      "foo",
    ],
    [
      `
set qux to { foo: "bar" }
output qux.foo
`,
      "bar",
    ],
    [
      `
set foo to {
  bar: "baz"
}

output foo.bar
`,
      "baz",
    ],
    [
      `
watch foo as foo_watcher
  output foo
`,
      "",
      { input: "", state: {} },
    ],
    [
      `
watch foo as foo_watcher
  output foo

set foo to "bar"
`,
      "bar",
      { input: "", state: {} },
    ],
    [
      `
watch foo as foo_watcher
  output foo

set foo to "baz"
`,
      "baz",
      { input: "", state: {} },
    ],
  ];

  // TODO also log out the context since that's very relevant to the test
  test.each(testCases)(
    "'%s' should return '%s'",
    async (
      knife: string,
      expected: string,
      context: Context = { input: "", state: {} },
    ) => {
      const { value: result } = await evaluate(knife, context);
      expect(result).toStrictEqual(expected);
    },
  );
});
