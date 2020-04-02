import React, { FC } from '../../lib/teact/teact';

import { getColorFromExtension, getFileSizeString } from './helpers/documentInfo';
import useShowTransition from '../../hooks/useShowTransition';
import buildClassName from '../../util/buildClassName';

import ProgressSpinner from '../ui/ProgressSpinner';

import './File.scss';
import { formatMediaDateTime } from '../../util/dateFormat';

type OwnProps = {
  name: string;
  extension?: string;
  size: number;
  timestamp?: number;
  className?: string;
  smaller?: boolean;
  isUploading?: boolean;
  isDownloading?: boolean;
  transferProgress?: number;
  onClick?: () => void;
};

const File: FC<OwnProps> = ({
  name,
  size,
  extension = '',
  timestamp,
  className,
  smaller,
  isUploading,
  isDownloading,
  transferProgress,
  onClick,
}) => {
  const {
    shouldRender: shouldSpinnerRender,
    transitionClassNames: spinnerClassNames,
  } = useShowTransition(isUploading || isDownloading, undefined, true);
  const color = getColorFromExtension(extension);
  const sizeString = getFileSizeString(size);

  return (
    <div
      className={buildClassName('File', className, smaller && 'smaller', onClick && 'interactive')}
      onClick={onClick}
    >
      <div className="file-icon-container">
        <div className={`file-icon ${color}`}>
          {extension.length <= 4 && (
            <span className="file-ext">{extension}</span>
          )}
        </div>
        {shouldSpinnerRender && (
          <div className={buildClassName('file-progress', color, spinnerClassNames)}>
            <ProgressSpinner progress={transferProgress} size={smaller ? 's' : 'm'} />
          </div>
        )}
        {onClick && <i className={buildClassName('icon-download', shouldSpinnerRender && 'hidden')} />}
      </div>
      <div className="file-info">
        <div className="file-title">{name}</div>
        <div className="file-subtitle">
          <span>
            {(isUploading || isDownloading) && transferProgress ? `${Math.round(transferProgress * 100)}%` : sizeString}
          </span>
          {timestamp && <span>{formatMediaDateTime(timestamp * 1000)}</span>}
        </div>
      </div>
    </div>
  );
};

export default File;
