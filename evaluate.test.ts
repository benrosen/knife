import { evaluate } from "./evaluate";

describe("evaluate", () => {
  test.each([["", ""]])(
    "%s should return %s",
    async (expected: string, knife: string) => {
      const result = await evaluate(knife);
      expect(result).toBe(expected);
    },
  );
});
