import { GramJsAnyRequest } from './types';

export async function invoke<R extends GramJsAnyRequest>(
  request: R,
  args: R['__args'],
): Promise<R['__response']> {
  // Implementation...
  //
  
  return null as any; // This is temporary.
}
