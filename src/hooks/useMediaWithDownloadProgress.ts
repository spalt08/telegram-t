import {
  useCallback, useEffect, useRef, useState,
} from '../lib/teact/teact';

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
  delay?: number | false,
) => {
  const mediaData = mediaHash ? mediaLoader.getFromMemory<T>(mediaHash) : undefined;
  const isProgressive = IS_PROGRESSIVE_SUPPORTED && mediaFormat === ApiMediaFormat.Progressive;
  const forceUpdate = useForceUpdate();
  const [downloadProgress, setDownloadProgress] = useState(mediaData && !isProgressive ? 1 : 0);
  const startedAtRef = useRef<number | undefined>();

  const handleProgress = useCallback((progress: number) => {
    if (!delay || (Date.now() - startedAtRef.current! < delay)) {
      setDownloadProgress(progress);
    }
  }, [delay]);

  useEffect(() => {
    if (!noLoad && mediaHash) {
      if (!mediaData) {
        setDownloadProgress(0);

        if (startedAtRef.current) {
          mediaLoader.cancelProgress(handleProgress);
        }

        startedAtRef.current = Date.now();

        mediaLoader.fetch(mediaHash, mediaFormat, handleProgress).then(() => {
          const spentTime = Date.now() - startedAtRef.current!;
          startedAtRef.current = undefined;

          if (!delay || spentTime >= delay) {
            forceUpdate();
          } else {
            setTimeout(forceUpdate, delay - spentTime);
          }
        });
      } else if (isProgressive) {
        setTimeout(() => {
          setDownloadProgress(PROGRESSIVE_PROGRESS);
        }, PROGRESSIVE_TIMEOUT);
      }
    }
  }, [noLoad, mediaHash, mediaData, mediaFormat, cacheBuster, forceUpdate, isProgressive, delay, handleProgress]);

  useEffect(() => {
    if (noLoad && startedAtRef.current) {
      mediaLoader.cancelProgress(handleProgress);
      setDownloadProgress(0);
    }
  }, [handleProgress, noLoad]);

  return { mediaData, downloadProgress };
};
