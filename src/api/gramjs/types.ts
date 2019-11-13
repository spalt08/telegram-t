export interface GramJsUpdate extends AnyLiteral {
  '@type': string,
}

export type OnUpdate = (update: GramJsUpdate) => void;
