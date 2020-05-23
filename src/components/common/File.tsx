import React, { FC, memo } from '../../lib/teact/teact';

import useShowTransition from '../../hooks/useShowTransition';
import useTransitionForMedia from '../../hooks/useTransitionForMedia';
import buildClassName from '../../util/buildClassName';
import { formatMediaDateTime } from '../../util/dateFormat';
import { getColorFromExtension, getFileSizeString } from './helpers/documentInfo';
import { getDocumentThumbnailDimensions } from './helpers/mediaDimensions';

import ProgressSpinner from '../ui/ProgressSpinner';

import './File.scss';

type OwnProps = {
  name: string;
  extension?: string;
  size: number;
  timestamp?: number;
  thumbnailDataUri?: string;
  previewData?: string;
  className?: string;
  smaller?: boolean;
  isTransferring?: boolean;
  isUploading?: boolean;
  transferProgress?: number;
  onClick?: () => void;
};

const File: FC<OwnProps> = ({
  name,
  size,
  extension = '',
  timestamp,
  thumbnailDataUri,
  previewData,
  className,
  smaller,
  isTransferring,
  isUploading,
  transferProgress,
  onClick,
}) => {
  const {
    shouldRender: shouldSpinnerRender,
    transitionClassNames: spinnerClassNames,
  } = useShowTransition(isTransferring, undefined, true);
  const color = getColorFromExtension(extension);
  const sizeString = getFileSizeString(size);

  const {
    shouldRenderThumb, shouldRenderFullMedia, transitionClassNames,
  } = useTransitionForMedia(previewData, 'slow');
  const { width, height } = getDocumentThumbnailDimensions(smaller);

  const fullClassName = buildClassName(
    'File',
    className,
    smaller && 'smaller',
    onClick && !isUploading && 'interactive',
  );

  return (
    <div
      className={fullClassName}
      onClick={isUploading ? undefined : onClick}
    >
      <div className="file-icon-container">
        {thumbnailDataUri || previewData ? (
          <div className="file-preview media-inner">
            {shouldRenderThumb && (
              <img
                src={thumbnailDataUri}
                className="thumbnail blur"
                width={width}
                height={height}
                alt=""
              />
            )}
            {shouldRenderFullMedia && (
              <img
                src={previewData}
                className={`full-media ${transitionClassNames}`}
                width={width}
                height={height}
                alt=""
              />
            )}
          </div>
        ) : (
          <div className={`file-icon ${color}`}>
            {extension.length <= 4 && (
              <span className="file-ext">{extension}</span>
            )}
          </div>
        )}
        {shouldSpinnerRender && (
          <div className={buildClassName('file-progress', color, spinnerClassNames)}>
            <ProgressSpinner
              progress={transferProgress}
              size={smaller ? 's' : 'm'}
              onClick={isUploading ? onClick : undefined}
            />
          </div>
        )}
        {onClick && <i className={buildClassName('icon-download', shouldSpinnerRender && 'hidden')} />}
      </div>
      <div className="file-info">
        <div className="file-title">{name}</div>
        <div className="file-subtitle">
          <span>
            {isTransferring && transferProgress ? `${Math.round(transferProgress * 100)}%` : sizeString}
          </span>
          {timestamp && <span>{formatMediaDateTime(timestamp * 1000)}</span>}
        </div>
      </div>
    </div>
  );
};

export default memo(File);
