/* New MTProto types */

type int = number;
type double = number;
type bytes = string | Uint8Array;
type long = number[] | string;

declare namespace MTP {
  export type fileLocationToBeDeprecated = {
    volumeId: long;
    localId: int;
  };

  export type inputPeerPhotoFileLocation = {
    _?: 'inputPeerPhotoFileLocation';
    // flags: number;
    big?: true;
    peer: MTP.InputPeer;
    volumeId: long;
    localId: int;
  };

  export type FileLocationNext = MTP.FileLocation | fileLocationToBeDeprecated;
}
