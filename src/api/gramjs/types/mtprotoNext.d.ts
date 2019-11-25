/* New MTProto types */

type int = number;
type double = number;
type bytes = string | Uint8Array;
type long = number[] | string;

declare namespace MTPNext {
  type FileLocationToBeDeprecated = {
    volumeId: long;
    localId: int;
  };

  export type UserProfilePhoto = {
    photoSmall: FileLocationToBeDeprecated;
    photoBig: FileLocationToBeDeprecated;
    dcId: int;
    photoId: long;
  };

  export type ChatPhoto = {
    photoSmall: FileLocationToBeDeprecated;
    photoBig: FileLocationToBeDeprecated;
    dcId: int;
  };

  export type InputPeerPhotoFileLocation = {
    _?: 'inputPeerPhotoFileLocation';
    // flags: number;
    big?: true;
    peer: MTP.InputPeer;
    volumeId: long;
    localId: int;
  };

  export type PhotoStrippedSize = Omit<MTP.photoCachedSize, 'w' | 'h'>;
}
