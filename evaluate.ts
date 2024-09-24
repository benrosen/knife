export const evaluate = async (
  value: string,
  context: { input: string },
): Promise<string> => {
  if (isOutputCommand(value)) {
    return evaluateOutputCommand(value, context);
  }

  if (isStringLiteral(value)) {
    return evaluateStringLiteral(value);
  }

  if (isNumberLiteral(value)) {
    return evaluateNumberLiteral(value).toString();
  }

  if (isInputKeyword(value)) {
    return evaluateInputKeyword(context);
  }

  if (isObjectPropertyAccess(value)) {
    return await evaluateObjectPropertyAccess(value, context);
  }

  if (isArrayIndexAccess(value)) {
    return await evaluateArrayIndexAccess(value, context);
  }

  return "";
};

const isOutputCommand = (command: string): boolean => {
  const outputCommandRegularExpression = /^output\s/;
  return outputCommandRegularExpression.test(command);
};

const evaluateOutputCommand = async (
  command: string,
  context: { input: string },
): Promise<string> => {
  const outputCommandPrefix = "output ";
  const restOfCommand = command.slice(outputCommandPrefix.length);
  return await evaluate(restOfCommand, context);
};

const isStringLiteral = (value: string): boolean => {
  const stringLiteralRegularExpression = /^".*"$/;
  return stringLiteralRegularExpression.test(value);
};

const evaluateStringLiteral = (value: string): string => {
  return value.slice(1, -1);
};

const isNumberLiteral = (value: string): boolean => {
  const numberLiteralRegularExpression = /^\d+$/;
  return numberLiteralRegularExpression.test(value);
};

const evaluateNumberLiteral = (value: string): number => {
  return JSON.parse(value);
};

const isInputKeyword = (value: string): boolean => {
  return value === "input";
};

const evaluateInputKeyword = (context: { input: string }): string => {
  return context.input;
};

const isObjectPropertyAccess = (value: string): boolean => {
  const objectPropertyAccessRegularExpression = /^.*\..*$/;
  return objectPropertyAccessRegularExpression.test(value);
};

const evaluateObjectPropertyAccess = async (
  value: string,
  context: { input: string },
): Promise<string> => {
  try {
    const pathSegments = value.split(".");

    const objectSegment: string = pathSegments[0];

    const propertyPathSegments = pathSegments.slice(1);

    const objectValue = await evaluate(objectSegment, context);

    let propertyValue = JSON.parse(objectValue);

    for (const pathSegment of propertyPathSegments) {
      propertyValue = propertyValue[pathSegment];
    }

    return await evaluate(JSON.stringify(propertyValue), context);
  } catch (error) {
    return "";
  }
};

const isArrayIndexAccess = (value: string): boolean => {
  const arrayIndexAccessRegularExpression = /^.+\[\d+]$/;
  return arrayIndexAccessRegularExpression.test(value);
};

const evaluateArrayIndexAccess = async (
  value: string,
  context: { input: string },
): Promise<string> => {
  // TODO this approach wont handle nested or sequential array access
  try {
    const arrayName = value.split("[")[0];

    const openingBracketCharacterIndex = value.indexOf("[");

    const closingBracketCharacterIndex = value.indexOf("]");

    const textBetweenBrackets = value.slice(
      openingBracketCharacterIndex + 1,
      closingBracketCharacterIndex,
    );

    const index = await evaluate(textBetweenBrackets, context);

    const arrayValue = await evaluate(arrayName, context);

    const array = JSON.parse(arrayValue);

    return await evaluate(JSON.stringify(array[index]), context);
  } catch (error) {
    return "";
  }
};
