export const evaluate = async (knife: string): Promise<string> => {
  const tokens = knife.split(" ");

  const isOutputCommand = tokens[0] === "output";

  if (isOutputCommand) {
    const remainingTokens = tokens.slice(1);

    const remainingKnife = remainingTokens.join(" ");

    return await evaluate(remainingKnife);
  }

  return knife;
};
