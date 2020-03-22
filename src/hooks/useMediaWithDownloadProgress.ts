import { useState, useEffect } from '../lib/teact/teact';
import * as mediaLoader from '../util/mediaLoader';

export default <T extends mediaLoader.Type = mediaLoader.Type.BlobUrl>(
  mediaHash: string | undefined,
  noLoad = false,
  // @ts-ignore (workaround for "could be instantiated with a different subtype" issue)
  type: T = mediaLoader.Type.BlobUrl,
) => {
  const mediaData = mediaHash ? mediaLoader.getFromMemory<T>(mediaHash) : undefined;

  const [, onMediaLoad] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(mediaData ? 1 : 0);

  useEffect(() => {
    if (!noLoad && mediaHash && !mediaData) {
      mediaLoader.fetch(mediaHash, type, setDownloadProgress).then(onMediaLoad);
    }
  }, [noLoad, mediaHash, mediaData, type]);

  return { mediaData, downloadProgress };
};
