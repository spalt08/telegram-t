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

type EmojiCategory = {
  id: string;
  name: string;
  emojis: string[];
};

type Emoji = {
  id: string;
  colons: string;
  native: string;
  skin?: number;
};

type EmojiWithSkins = Record<number, Emoji>;

type AllEmojis = Record<string, Emoji | EmojiWithSkins>;

declare module '*.png';

declare module 'pako/dist/pako_inflate' {
  function inflate(...args: any[]): string;
}

declare module 'emoji-mart/dist-modern/utils/emoji-index/nimble-emoji-index'

type WindowWithPerf = typeof window & { perf: AnyLiteral };
