import { useEffect, useRef, useState } from '../lib/teact/teact';

import { ApiMediaFormat } from '../api/types';

import { IS_PROGRESSIVE_SUPPORTED } from '../util/environment';
import * as mediaLoader from '../util/mediaLoader';
import useForceUpdate from './useForceUpdate';

const PROGRESSIVE_PROGRESS = 0.75;
const PROGRESSIVE_TIMEOUT = 1500;

export default <T extends ApiMediaFormat = ApiMediaFormat.BlobUrl>(
  mediaHash: string | undefined,
  noLoad = false,
  // @ts-ignore (workaround for "could be instantiated with a different subtype" issue)
  mediaFormat: T = ApiMediaFormat.BlobUrl,
  cacheBuster?: number,
) => {
  const mediaData = mediaHash ? mediaLoader.getFromMemory<T>(mediaHash) : undefined;
  const isProgressive = IS_PROGRESSIVE_SUPPORTED && mediaFormat === ApiMediaFormat.Progressive;
  const forceUpdate = useForceUpdate();
  const [downloadProgress, setDownloadProgress] = useState(mediaData && !isProgressive ? 1 : 0);
  const isDownloadingRef = useRef(false);

  useEffect(() => {
    if (!noLoad && mediaHash) {
      if (!mediaData) {
        isDownloadingRef.current = true;
        setDownloadProgress(0);
        mediaLoader.cancelProgress(setDownloadProgress);
        mediaLoader.fetch(mediaHash, mediaFormat, setDownloadProgress).then(() => {
          isDownloadingRef.current = false;
          forceUpdate();
        });
      } else if (isProgressive) {
        setTimeout(() => {
          setDownloadProgress(PROGRESSIVE_PROGRESS);
        }, PROGRESSIVE_TIMEOUT);
      }
    }
  }, [noLoad, mediaHash, mediaData, mediaFormat, cacheBuster, forceUpdate, isProgressive]);

  useEffect(() => {
    if (noLoad && isDownloadingRef.current) {
      mediaLoader.cancelProgress(setDownloadProgress);
      setDownloadProgress(0);
    }
  }, [noLoad]);

  return { mediaData, downloadProgress };
};
