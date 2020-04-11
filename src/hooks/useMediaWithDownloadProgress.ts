import { useState, useEffect } from '../lib/teact/teact';

import { ApiMediaFormat } from '../api/types';

import * as mediaLoader from '../util/mediaLoader';
import useForceUpdate from './useForceUpdate';

export default <T extends ApiMediaFormat = ApiMediaFormat.BlobUrl>(
  mediaHash: string | undefined,
  noLoad = false,
  // @ts-ignore (workaround for "could be instantiated with a different subtype" issue)
  mediaFormat: T = ApiMediaFormat.BlobUrl,
  cacheBuster?: number,
) => {
  const mediaData = mediaHash ? mediaLoader.getFromMemory<T>(mediaHash) : undefined;
  const forceUpdate = useForceUpdate();
  const [downloadProgress, setDownloadProgress] = useState(mediaData ? 1 : 0);

  useEffect(() => {
    if (!noLoad && mediaHash && !mediaData) {
      mediaLoader.fetch(mediaHash, mediaFormat, setDownloadProgress).then(forceUpdate);
    }
  }, [noLoad, mediaHash, mediaData, mediaFormat, cacheBuster, forceUpdate]);

  return { mediaData, downloadProgress };
};
