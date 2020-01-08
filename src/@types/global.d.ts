declare const process: { env: Record<string, string> };

type AnyLiteral = Record<string, any>;
type AnyClass = new (...args: any[]) => any;

type Country = {
  id: string;
  name: string;
  flag: string;
  code: string;
};

declare module '*.png';

declare module 'pako/dist/pako_inflate' {
  function inflate(...args: any[]): string;
}
