import { evaluate } from "./evaluate";
import { run } from "./run";
import { log } from "./log";

jest.mock("./evaluate", () => ({
  evaluate: jest.fn(),
}));

const mockedEvaluate = jest.mocked(evaluate);

jest.mock("./log", () => ({
  log: jest.fn(),
}));

const mockedLog = jest.mocked(log);

describe("run", () => {
  it("should call the evaluate function with the given knife code", () => {
    const knife = "output 1";

    run(knife);

    expect(mockedEvaluate).toHaveBeenCalledWith(knife);
  });

  it("should log the result of the evaluate function", async () => {
    const mockResolvedValue = "mocked result";

    mockedEvaluate.mockResolvedValueOnce(mockResolvedValue);

    await run("output 1");

    expect(mockedLog).toHaveBeenCalledWith(mockResolvedValue);
  });
});
