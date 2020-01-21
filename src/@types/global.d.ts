declare const process: NodeJS.Process;

type AnyLiteral = Record<string, any>;
type AnyClass = new (...args: any[]) => any;
type AnyFunction = (...args: any) => any;
type AnyToVoidFunction = (...args: any) => void;
type NoneToVoidFunction = () => void;

type Country = {
  id: string;
  name: string;
  flag: string;
  code: string;
};

declare module '*.png';

declare module '../lib/pako_inflate' {
  function inflate(...args: any[]): string;
}

type WindowWithPerf = typeof window & { perf: AnyLiteral };
