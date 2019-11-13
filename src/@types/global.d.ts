declare const process: { env: Record<string, string> };

type AnyLiteral = Record<string, any>;

type Country = {
  id: string;
  name: string;
  flag: string;
  code: string;
};
