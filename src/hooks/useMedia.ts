import { useEffect } from '../lib/teact/teact';

import { ApiMediaFormat } from '../api/types';

import * as mediaLoader from '../util/mediaLoader';
import useForceUpdate from './useForceUpdate';

export default <T extends ApiMediaFormat = ApiMediaFormat.BlobUrl>(
  mediaHash: string | false | undefined,
  noLoad = false,
  // @ts-ignore (workaround for "could be instantiated with a different subtype" issue)
  mediaFormat: T = ApiMediaFormat.BlobUrl,
) => {
  const mediaData = mediaHash ? mediaLoader.getFromMemory<T>(mediaHash) : undefined;
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    if (!noLoad && mediaHash && !mediaData) {
      mediaLoader.fetch(mediaHash, mediaFormat).then(forceUpdate);
    }
  }, [noLoad, mediaHash, mediaData, mediaFormat, forceUpdate]);

  return mediaData;
};
