export type Context = { input: string; state: { [key: string]: string } };

export type Evaluation = {
  value: string;
  context: Context;
};

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
