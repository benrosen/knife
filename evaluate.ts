export const evaluate = async (knife: string): Promise<string> => {
  const outputCommand = "output";
  const outputCommandPlusSpace = outputCommand + " ";

  if (knife.startsWith(outputCommandPlusSpace)) {
    const restOfKnife = knife.slice(outputCommandPlusSpace.length);

    return await evaluate(restOfKnife);
  }

  return knife;
};
