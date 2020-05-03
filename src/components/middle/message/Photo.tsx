import React, {
  FC, useCallback, useLayoutEffect, useRef, useState,
} from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';
import { AlbumMediaParameters } from '../../common/helpers/mediaDimensions';

import { AUTO_LOAD_MEDIA } from '../../../config';
import {
  getMessagePhoto,
  getMessageWebPagePhoto,
  getMessageMediaHash,
  getMessageMediaThumbDataUri,
  getMediaTransferState,
  isOwnMessage,
} from '../../../modules/helpers';
import useMediaWithDownloadProgress from '../../../hooks/useMediaWithDownloadProgress';
import useTransitionForMedia from '../../../hooks/useTransitionForMedia';
import useShowTransition from '../../../hooks/useShowTransition';
import usePrevious from '../../../hooks/usePrevious';
import buildClassName from '../../../util/buildClassName';
import getCustomAppendixBg from './helpers/getCustomAppendixBg';
import { calculateMediaDimensions } from './helpers/mediaDimensions';

import ProgressSpinner from '../../ui/ProgressSpinner';

type OwnProps = {
  id?: string;
  message: ApiMessage;
  load?: boolean;
  uploadProgress?: number;
  size?: 'inline' | 'pictogram';
  shouldAffectAppendix?: boolean;
  albumMediaParams?: AlbumMediaParameters;
  onClick?: () => void;
  onCancelUpload?: () => void;
};

const Photo: FC<OwnProps> = ({
  id,
  message,
  load,
  uploadProgress,
  size = 'inline',
  shouldAffectAppendix,
  albumMediaParams,
  onClick,
  onCancelUpload,
}) => {
  const elementRef = useRef<HTMLDivElement>();

  const photo = (getMessagePhoto(message) || getMessageWebPagePhoto(message))!;
  const localBlobUrl = photo.blobUrl;
  const thumbDataUri = getMessageMediaThumbDataUri(message);

  const [isDownloadAllowed, setIsDownloadAllowed] = useState(AUTO_LOAD_MEDIA);
  const shouldDownload = isDownloadAllowed && load;
  const {
    mediaData, downloadProgress,
  } = useMediaWithDownloadProgress(getMessageMediaHash(message, size), !shouldDownload);
  const fullMediaData = localBlobUrl || mediaData;
  const {
    isUploading, isTransferring, transferProgress,
  } = getMediaTransferState(message, uploadProgress || downloadProgress, shouldDownload && !fullMediaData);
  const wasDownloadDisabled = usePrevious(isDownloadAllowed) === false;
  const {
    shouldRender: shouldRenderSpinner,
    transitionClassNames: spinnerClassNames,
  } = useShowTransition(isTransferring, undefined, wasDownloadDisabled, 'slow');
  const {
    shouldRenderThumb, shouldRenderFullMedia, transitionClassNames,
  } = useTransitionForMedia(fullMediaData, 'slow');

  const handleClick = useCallback(() => {
    if (isUploading) {
      if (onCancelUpload) {
        onCancelUpload();
      }
    } else if (!fullMediaData) {
      setIsDownloadAllowed((isAllowed) => !isAllowed);
    } else if (onClick) {
      onClick();
    }
  }, [fullMediaData, isUploading, onCancelUpload, onClick]);

  const isOwn = isOwnMessage(message);
  useLayoutEffect(() => {
    if (!shouldAffectAppendix) {
      return;
    }

    const contentEl = elementRef.current!.closest<HTMLDivElement>('.message-content')!;

    if (fullMediaData) {
      getCustomAppendixBg(fullMediaData, isOwn).then((appendixBg) => {
        contentEl.style.setProperty('--appendix-bg', appendixBg);
        contentEl.classList.add('has-custom-appendix');
      });
    } else {
      contentEl.classList.add('has-appendix-thumb');
    }
  }, [fullMediaData, isOwn, shouldAffectAppendix]);

  const { width, height, isSmall } = calculateMediaDimensions(message, albumMediaParams);

  const className = buildClassName(
    'media-inner',
    !isUploading && 'interactive',
    isSmall && 'small-image',
    width === height && 'square-image',
  );

  const thumbClassName = buildClassName(
    'thumbnail blur',
    !thumbDataUri && 'empty',
  );

  return (
    <div
      id={id}
      ref={elementRef}
      className={className}
      onClick={isUploading ? undefined : handleClick}
    >
      {shouldRenderThumb && (
        <img
          src={thumbDataUri}
          className={thumbClassName}
          width={width}
          height={height}
          alt=""
        />
      )}
      {shouldRenderFullMedia && (
        <img
          src={fullMediaData}
          className={`full-media ${transitionClassNames}`}
          width={width}
          height={height}
          alt=""
        />
      )}
      {shouldRenderSpinner && (
        <div className={`media-loading ${spinnerClassNames}`}>
          <ProgressSpinner progress={transferProgress} onClick={handleClick} />
        </div>
      )}
      {!fullMediaData && !isDownloadAllowed && (
        <i className="icon-download" />
      )}
      {isTransferring && (
        <span className="message-upload-progress">{Math.round(transferProgress * 100)}%</span>
      )}
    </div>
  );
};

export default Photo;
