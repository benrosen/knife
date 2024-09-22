import { evaluate } from "./evaluate";
import { log } from "./log";

export const run = async (knife: string): Promise<void> => {
  const awaitedResult = await evaluate(knife);

  log(awaitedResult);
};
