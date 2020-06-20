import React, {
  FC, memo, useCallback, useEffect, useState,
} from '../../../lib/teact/teact';
import { ApiWallpaper, ApiMediaFormat } from '../../../api/types';

import useTransitionForMedia from '../../../hooks/useTransitionForMedia';
import buildClassName from '../../../util/buildClassName';
import useMedia from '../../../hooks/useMedia';
import useMediaWithDownloadProgress from '../../../hooks/useMediaWithDownloadProgress';
import useShowTransition from '../../../hooks/useShowTransition';
import usePrevious from '../../../hooks/usePrevious';

import ProgressSpinner from '../../ui/ProgressSpinner';

import './WallpaperTile.scss';

type OwnProps = {
  wallpaper: ApiWallpaper;
  isSelected: boolean;
  onClick: (slug: string, blobUrl: string) => void;
};

const WallpaperTile: FC<OwnProps> = ({
  wallpaper,
  isSelected,
  onClick,
}) => {
  const { slug, document } = wallpaper;

  const localMediaHash = `wallpaper${document.id!}`;
  const thumbDataUri = document.thumbnail!.dataUri;
  const previewBlobUrl = useMedia(`${localMediaHash}?size=m`);
  const {
    shouldRenderThumb, shouldRenderFullMedia, transitionClassNames,
  } = useTransitionForMedia(previewBlobUrl, 'slow');
  const [isDownloadAllowed, setIsDownloadAllowed] = useState(false);
  const {
    mediaData: fullMedia, downloadProgress,
  } = useMediaWithDownloadProgress<ApiMediaFormat.BlobUrl>(localMediaHash, !isDownloadAllowed);
  const wasDownloadDisabled = usePrevious(isDownloadAllowed) === false;
  const {
    shouldRender: shouldRenderSpinner,
    transitionClassNames: spinnerClassNames,
  } = useShowTransition(isDownloadAllowed && !fullMedia, undefined, wasDownloadDisabled, 'slow');

  useEffect(() => {
    if (fullMedia) {
      onClick(slug, fullMedia);
    }
  }, [fullMedia, onClick, slug]);

  const handleClick = useCallback(() => {
    if (fullMedia) {
      onClick(slug, fullMedia);
    } else {
      setIsDownloadAllowed((isAllowed) => !isAllowed);
    }
  }, [fullMedia, onClick, slug]);

  const className = buildClassName(
    'WallpaperTile',
    isSelected && 'selected',
  );

  return (
    <div className={className} onClick={handleClick}>
      <div className="media-inner">
        {shouldRenderThumb && (
          <img
            src={thumbDataUri}
            className="thumbnail blur"
            alt=""
          />
        )}
        {shouldRenderFullMedia && (
          <img
            src={previewBlobUrl}
            className={`full-media ${transitionClassNames}`}
            alt=""
          />
        )}
        {shouldRenderSpinner && (
          <div className={buildClassName('spinner-container', spinnerClassNames)}>
            <ProgressSpinner progress={downloadProgress} onClick={handleClick} />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(WallpaperTile);
