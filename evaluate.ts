type Context = { input: string; state: { [key: string]: string } };

export const evaluate = async (
  value: string,
  context: Context,
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

  if (isObjectLiteral(value)) {
    return await evaluateObjectLiteral(value, context);
  }

  if (isObjectPropertyAccess(value)) {
    return await evaluateObjectPropertyAccess(value, context);
  }

  if (isArrayLiteral(value)) {
    return await evaluateArrayLiteral(value, context);
  }

  if (isArrayIndexAccess(value)) {
    return await evaluateArrayIndexAccess(value, context);
  }

  if (isSetToCommand(value)) {
    const newContext = await evaluateSetToCommand(value, context);
    return "";
  }

  return "";
};

const isOutputCommand = (command: string): boolean => {
  const outputCommandRegularExpression = /^output\s/;
  return outputCommandRegularExpression.test(command);
};

const evaluateOutputCommand = async (
  command: string,
  context: Context,
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

const isArrayLiteral = (value: string): boolean => {
  const arrayLiteralRegularExpression = /^\[.*\]$/;
  return arrayLiteralRegularExpression.test(value);
};

const evaluateArrayLiteral = async (
  value: string,
  context: Context,
): Promise<string> => {
  // TODO i probably need to evaluate the items in this instead; what if "input" is an item e.g. "[input]"?
  return value;
};

const isObjectLiteral = (value: string): boolean => {
  const objectLiteralRegularExpression = /^\{.*\}$/;
  return objectLiteralRegularExpression.test(value);
};

const evaluateObjectLiteral = async (
  value: string,
  context: Context,
): Promise<string> => {
  // TODO i probably need to evaluate this recursively; what if "input" is a value e.g. "{ foo: input }"?
  return value;
};

const isInputKeyword = (value: string): boolean => {
  return value === "input";
};

const evaluateInputKeyword = (context: Context): string => {
  return context.input;
};

const isObjectPropertyAccess = (value: string): boolean => {
  const objectPropertyAccessRegularExpression = /^.*\.[^\[\]]+$/;
  return objectPropertyAccessRegularExpression.test(value);
};

const evaluateObjectPropertyAccess = async (
  value: string,
  context: Context,
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
  // TODO this is probably wrong; i think it will count [[0]] as an array index access even though it's not (it's an array literal)
  const arrayIndexAccessRegularExpression = /^.+\[.*\]$/;
  return arrayIndexAccessRegularExpression.test(value);
};

const evaluateArrayIndexAccess = async (
  value: string,
  context: Context,
): Promise<string> => {
  try {
    const lastClosingBracketIndex = value.lastIndexOf("]");

    let openingBracketIndex;

    const bracketStack = [];

    for (let i = lastClosingBracketIndex; i >= 0; i--) {
      const currentCharacter = value[i];

      if (currentCharacter === "]") {
        bracketStack.push(currentCharacter);
      }

      if (currentCharacter === "[") {
        bracketStack.pop();

        if (bracketStack.length === 0) {
          openingBracketIndex = i;
          break;
        }
      }
    }

    if (openingBracketIndex === undefined) {
      return "";
    }

    const arraySegment = value.slice(0, openingBracketIndex);

    const indexSegment = value.slice(
      openingBracketIndex + 1,
      lastClosingBracketIndex,
    );

    const arrayValue = await evaluate(arraySegment, context);

    const indexValue = await evaluate(indexSegment, context);

    const array = JSON.parse(arrayValue);

    const index = JSON.parse(indexValue);

    const result = array[index];

    const evaluatedResult = await evaluate(JSON.stringify(result), context);

    return evaluatedResult;
  } catch (error) {
    return "";
  }
};

const isSetToCommand = (command: string): boolean => {
  const setToCommandRegularExpression = /^set\s+(\w+)\s+to\s+([\s\S]+)$/;
  return setToCommandRegularExpression.test(command);
};

const evaluateSetToCommand = async (
  command: string,
  context: Context,
): Promise<Context> => {
  const setToCommandRegularExpression = /^set\s+(\w+)\s+to\s+([\s\S]+)$/;
  const matches = command.match(setToCommandRegularExpression);

  if (matches === null) {
    return context;
  }

  const [, key, value] = matches;

  const evaluatedValue = await evaluate(value, context);

  return {
    ...context,
    state: {
      ...context.state,
      [key]: evaluatedValue,
    },
  };
};
