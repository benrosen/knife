import { Context, Evaluation } from "./types";

export const evaluate = async (
  value: string,
  context: Context,
): Promise<Evaluation> => {
  const indexOfFirstStatementSeparator =
    getIndexOfFirstStatementSeparator(value);

  const isMultipleStatements = indexOfFirstStatementSeparator !== -1;

  if (isMultipleStatements) {
    const firstStatement = value.slice(0, indexOfFirstStatementSeparator);

    // TODO might need to check if first statement is an output command; if it is, just evaluate and return without considering subsequent statements since an output command should end the evaluation (like a return statement)

    const restOfValue = value.slice(indexOfFirstStatementSeparator).trim();

    const { context: newContext } = await evaluate(firstStatement, context);

    return await evaluate(restOfValue, newContext);
  }

  if (isOutputCommand(value)) {
    return evaluateOutputCommand(value, context);
  }

  if (isStringLiteral(value)) {
    return {
      value: evaluateStringLiteral(value),
      context,
    };
  }

  if (isNumberLiteral(value)) {
    return {
      value: evaluateNumberLiteral(value),
      context,
    };
  }

  if (isInputKeyword(value)) {
    return {
      value: evaluateInputKeyword(context),
      context,
    };
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
    return {
      value: "",
      context: newContext,
    };
  }

  if (isGetCommand(value, context)) {
    return await evaluateGetCommand(value, context);
  }

  return {
    value: "",
    context,
  };
};

const getIndexOfFirstStatementSeparator = (value: string): number => {
  const statementSeparatorCharacter = "\n";

  const indicesOfStringDelimiters = [];
  const indicesOfArrayDelimiters = [];
  const indicesOfObjectDelimiters = [];

  const isContainedInString = () => {
    return indicesOfStringDelimiters.length % 2 === 1;
  };

  const isContainedInArray = () => {
    return indicesOfArrayDelimiters.length > 0;
  };

  const isContainedInObject = () => {
    return indicesOfObjectDelimiters.length > 0;
  };

  for (let i = 0; i < value.length; i++) {
    const currentCharacter = value[i];

    if (currentCharacter === '"') {
      indicesOfStringDelimiters.push(i);
    }

    if (currentCharacter === "[") {
      indicesOfArrayDelimiters.push(i);
    }

    if (currentCharacter === "]") {
      indicesOfArrayDelimiters.pop();
    }

    if (currentCharacter === "{") {
      indicesOfObjectDelimiters.push(i);
    }

    if (currentCharacter === "}") {
      indicesOfObjectDelimiters.pop();
    }

    if (
      currentCharacter === statementSeparatorCharacter &&
      !isContainedInString() &&
      !isContainedInArray() &&
      !isContainedInObject()
    ) {
      return i;
    }
  }

  return -1;
};

const evaluateMultipleStatements = async (
  value: string,
  context: Context,
): Promise<Evaluation> => {
  // TODO get the index of the first newline character that represents a statement separator (e.g. not in a string, array, or object, or comment)
  // TODO split the string into two parts: the first statement and the rest of the statements
  // TODO evaluate the first statement
  // TODO evaluate the rest of the statements using the context resulting from the first statement evaluation
  return {
    value: "",
    context,
  };
};

const isOutputCommand = (command: string): boolean => {
  const outputCommandRegularExpression = /^output\s/;
  return outputCommandRegularExpression.test(command);
};

const evaluateOutputCommand = async (
  command: string,
  context: Context,
): Promise<Evaluation> => {
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

const evaluateNumberLiteral = (value: string): string => {
  return value;
};

const isArrayLiteral = (value: string): boolean => {
  const arrayLiteralRegularExpression = /^\[.*\]$/s;
  return arrayLiteralRegularExpression.test(value);
};

const evaluateArrayLiteral = async (
  value: string,
  context: Context,
): Promise<Evaluation> => {
  const arrayAsString: string = value;

  const arrayAsStringWithOuterBracketsRemoved = arrayAsString.slice(1, -1);

  const characterBuffer: string[] = [];

  const clearCharacterBuffer = () => {
    characterBuffer.length = 0;
  };

  const arrayItemsAsStrings: string[] = [];

  const writeCharacterBufferToItems = () => {
    const item = characterBuffer.join("").trim();
    arrayItemsAsStrings.push(item);
    clearCharacterBuffer();
  };

  const stringDelimiterInstanceIndices: number[] = [];

  const arrayDelimiterInstanceIndices: number[] = [];

  const objectDelimiterInstanceIndices: number[] = [];

  const isContainedInString = () => {
    return stringDelimiterInstanceIndices.length % 2 === 1;
  };

  const isContainedInArray = () => {
    return arrayDelimiterInstanceIndices.length > 0;
  };

  const isContainedInObject = () => {
    return objectDelimiterInstanceIndices.length > 0;
  };

  for (let i = 0; i < arrayAsStringWithOuterBracketsRemoved.length; i++) {
    const currentCharacter = arrayAsStringWithOuterBracketsRemoved[i];

    // TODO escaped quotes /" ?
    if (currentCharacter === '"') {
      stringDelimiterInstanceIndices.push(i);
    }

    if (currentCharacter === "[") {
      arrayDelimiterInstanceIndices.push(i);
    }

    if (currentCharacter === "]") {
      arrayDelimiterInstanceIndices.pop();
    }

    if (currentCharacter === "{") {
      objectDelimiterInstanceIndices.push(i);
    }

    if (currentCharacter === "}") {
      objectDelimiterInstanceIndices.pop();
    }

    if (
      currentCharacter === "," &&
      !isContainedInString() &&
      !isContainedInArray() &&
      !isContainedInObject()
    ) {
      writeCharacterBufferToItems();
    } else {
      characterBuffer.push(currentCharacter);
    }

    if (i === arrayAsStringWithOuterBracketsRemoved.length - 1) {
      writeCharacterBufferToItems();
    }
  }

  const evaluatedArrayItems = [];

  for (const arrayItemAsString of arrayItemsAsStrings) {
    let { value: evaluatedArrayItem, context: newContext } = await evaluate(
      arrayItemAsString,
      context,
    );

    try {
      evaluatedArrayItem = JSON.parse(evaluatedArrayItem);
    } catch (error) {
      // do nothing
    }

    context = newContext;

    evaluatedArrayItems.push(evaluatedArrayItem);
  }

  return {
    value: JSON.stringify(evaluatedArrayItems),
    context,
  };
};

const isObjectLiteral = (value: string): boolean => {
  const objectLiteralRegularExpression = /^\{[\s\S]*}$/;
  return objectLiteralRegularExpression.test(value);
};

const evaluateObjectLiteral = async (
  value: string,
  context: Context,
): Promise<Evaluation> => {
  const objectAsString = value;

  const objectAsStringWithOuterBracesRemoved = objectAsString.slice(1, -1);

  const keyBuffer: string[] = [];
  const valueBuffer: string[] = [];

  const objectEntries: { key: string; value: string }[] = [];

  let parsingKey = true;

  const stringDelimiterInstanceIndices: number[] = [];
  const arrayDelimiterInstanceIndices: number[] = [];
  const objectDelimiterInstanceIndices: number[] = [];

  const isContainedInString = () => {
    return stringDelimiterInstanceIndices.length % 2 === 1;
  };

  const isContainedInArray = () => {
    return arrayDelimiterInstanceIndices.length > 0;
  };

  const isContainedInObject = () => {
    return objectDelimiterInstanceIndices.length > 0;
  };

  for (let i = 0; i < objectAsStringWithOuterBracesRemoved.length; i++) {
    const currentCharacter = objectAsStringWithOuterBracesRemoved[i];

    if (currentCharacter === '"') {
      stringDelimiterInstanceIndices.push(i);
    }

    if (currentCharacter === "[") {
      arrayDelimiterInstanceIndices.push(i);
    }

    if (currentCharacter === "]") {
      arrayDelimiterInstanceIndices.pop();
    }

    if (currentCharacter === "{") {
      objectDelimiterInstanceIndices.push(i);
    }

    if (currentCharacter === "}") {
      objectDelimiterInstanceIndices.pop();
    }

    if (
      currentCharacter === ":" &&
      !isContainedInString() &&
      !isContainedInArray() &&
      !isContainedInObject() &&
      parsingKey
    ) {
      parsingKey = false;
      continue;
    }

    if (
      currentCharacter === "," &&
      !isContainedInString() &&
      !isContainedInArray() &&
      !isContainedInObject() &&
      !parsingKey
    ) {
      const key = keyBuffer.join("").trim();
      const value = valueBuffer.join("").trim();
      objectEntries.push({ key, value });
      keyBuffer.length = 0;
      valueBuffer.length = 0;
      parsingKey = true;
      continue;
    }

    if (parsingKey) {
      keyBuffer.push(currentCharacter);
    } else {
      valueBuffer.push(currentCharacter);
    }

    if (i === objectAsStringWithOuterBracesRemoved.length - 1) {
      const key = keyBuffer.join("").trim();
      const value = valueBuffer.join("").trim();

      if (key.length > 0 && value.length > 0) {
        objectEntries.push({ key, value });
      }
    }
  }

  const evaluatedObject: { [key: string]: any } = {};

  for (const entry of objectEntries) {
    let keyString = entry.key;
    let valueString = entry.value;

    if (isStringLiteral(keyString)) {
      keyString = evaluateStringLiteral(keyString);
    }

    let { value: evaluatedValue, context: newContext } = await evaluate(
      valueString,
      context,
    );

    try {
      evaluatedValue = JSON.parse(evaluatedValue);
    } catch (error) {
      // do nothing
    }

    context = newContext;

    evaluatedObject[keyString] = evaluatedValue;
  }

  return {
    value: JSON.stringify(evaluatedObject),
    context,
  };
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
): Promise<Evaluation> => {
  try {
    const pathSegments = value.split(".");

    const objectSegment: string = pathSegments[0];

    const propertyPathSegments = pathSegments.slice(1);

    const { value: objectValue } = await evaluate(objectSegment, context);

    let propertyValue = JSON.parse(objectValue);

    for (const pathSegment of propertyPathSegments) {
      propertyValue = propertyValue[pathSegment];
    }

    return await evaluate(JSON.stringify(propertyValue), context);
  } catch (error) {
    return {
      value: "",
      context,
    };
  }
};

const isArrayIndexAccess = (value: string): boolean => {
  // TODO this is probably wrong; i think it will count [[0]] as an array index access even though it's not (it's an array literal)
  const arrayIndexAccessRegularExpression = /^[^\s\[{]\S*?(\[.*?])+$/s;

  return arrayIndexAccessRegularExpression.test(value);
};

const evaluateArrayIndexAccess = async (
  value: string,
  context: Context,
): Promise<Evaluation> => {
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
      return {
        value: "",
        context,
      };
    }

    const arraySegment = value.slice(0, openingBracketIndex);

    const indexSegment = value.slice(
      openingBracketIndex + 1,
      lastClosingBracketIndex,
    );

    const { value: arrayValue } = await evaluate(arraySegment, context);

    const { value: indexValue } = await evaluate(indexSegment, context);

    const array = JSON.parse(arrayValue);

    const index = JSON.parse(indexValue);

    const result = array[index];

    const evaluatedResult = await evaluate(JSON.stringify(result), context);

    return evaluatedResult;
  } catch (error) {
    return {
      value: "",
      context,
    };
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

  const { value: evaluatedValue } = await evaluate(value, context);

  return {
    ...context,
    state: {
      ...context.state,
      [key]: evaluatedValue,
    },
  };
};

const isGetCommand = (command: string, context: Context): boolean => {
  const stateKeys = Object.keys(context.state);

  return stateKeys.includes(command);
};

const evaluateGetCommand = async (
  command: string,
  context: Context,
): Promise<Evaluation> => {
  return {
    value: context.state[command],
    context,
  };
};
