type Reader = any; // To be defined.
type Client = any; // To be defined.
type Utils = any; // To be defined.
type long = number[] | string;
type bytes = string | Uint8Array;

interface TlInstance {
  CONSTRUCTOR_ID: number;
  SUBCLASS_OF_ID: number;
  
  getBytes(): Buffer;
}

interface TlConstructor<Args extends AnyLiteral> {
  // This is for types check only.
  __args: Args;
  
  new(args: Args): TlInstance & Args;
  
  serializeBytes(data: Buffer | string): Buffer;
  
  serializeDate(date: Date | number): Buffer;
  
  fromReader(reader: Reader): TlInstance & Args;
}

interface TlRequest<Args, Response> extends TlConstructor<Args> {
  // This is for types check only.
  __response: Response;
  
  readResult(reader: Reader): Buffer;
  
  resolve(client: Client, utils: Utils): Promise<void>;
}

// Begin of generated code.

interface GramJsTypes {
  InputPeer: (
    InstanceType<GramJsConstructors['InputPeerUser']> |
    InstanceType<GramJsConstructors['InputPeerChat']>
    );
  InputFileLocation: InstanceType<GramJsConstructors['InputPeerPhotoFileLocation']>; // And some others...
  upload: {
    File: (
      InstanceType<GramJsConstructors['upload']['File']> |
      InstanceType<GramJsConstructors['upload']['FileCdnRedirect']>
      );
  };
}

interface GramJsConstructors {
  InputPeerUser: TlConstructor<{
    userId: number,
    accessHash: long
  }>
  InputPeerChat: TlConstructor<{
    chatId: number,
  }>
  InputPeerPhotoFileLocation: TlConstructor<{
    big?: boolean;
    peer: GramJsTypes['InputPeer'];
    volumeId: long;
    localId: number
  }>;
  
  upload: {
    File: TlConstructor<{
      type: string; // GramJsTypes['storage.FileType']
      mtime: number;
      bytes: bytes;
    }>;
    FileCdnRedirect: TlConstructor<{
      /* Args will go here... */
    }>
  }
}

interface GramJsRequests {
  upload: {
    GetFileRequest: TlRequest<{
      flags?: number,
      precise?: true;
      location: GramJsTypes['InputFileLocation'];
      offset: number;
      limit: number;
    }, GramJsTypes['upload']['File']>;
  }
}

// End of generated code.

export interface GramJsApi {
  constructors: GramJsConstructors;
  requests: GramJsRequests;
}

export type GramJsAnyRequest = GramJsRequests['upload'][keyof GramJsRequests['upload']];
