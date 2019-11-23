/*
 * File #1: `gramjs/tl/types.ts`
 */
// This TypeScript definitions could be auto-generated. They will be cleaned out on production build.
export interface GramJsApi {
  // ...
  PeerUser: new(args: MTP.peerUser) => MTP.peerUser;
  // ...
}

// -----------------------------------------------

/*
 * File #2: `gramjs/tl/buildApiFromTlSchema.ts`
 */
function buildApiFromTlSchema() {
  const apiDefinitions = {};
  
  // Some magic code that will parse `.tl`-schemas and create classes.
  
  return apiDefinitions;
}

// Here we are forcing the "magic" function to "return" pre-defined types with `as` keyword.
export const gramJsApi = buildApiFromTlSchema() as GramJsApi;

// -----------------------------------------------

/*
 * File #3: Some app code file, that wants to get a `PeerUser` instance.
 */
const { PeerUser } = gramJsApi;

const peerUser = new PeerUser({
  // Type check works here!
  userId: 'wrongId',
});
