import React, { FC } from '../../lib/teact/teact';

import { getColorFromExtension, getFileSizeString } from './helpers/documentInfo';
import useShowTransition from '../../hooks/useShowTransition';
import buildClassName from '../../util/buildClassName';

import ProgressSpinner from '../ui/ProgressSpinner';

import './File.scss';

type IProps = {
  name: string;
  extension?: string;
  size: number;
  uploadProgress?: number;
  className?: string;
  smaller?: boolean;
  isUploading?: boolean;
  isDownloading?: boolean;
  transferProgress?: number;
  onCancelTransfer?: () => void;
};

const File: FC<IProps> = ({
  name,
  size,
  extension = '',
  className,
  smaller,
  isUploading,
  isDownloading,
  transferProgress,
  onCancelTransfer,
}) => {
  const {
    shouldRender: shouldSpinnerRender,
    transitionClassNames: spinnerClassNames,
  } = useShowTransition(isUploading || isDownloading, undefined, true);
  const color = getColorFromExtension(extension);
  const sizeString = getFileSizeString(size);

  return (
    <div className={buildClassName('File', className, smaller && 'smaller')}>
      <div className="file-icon-container">
        <div className={`file-icon ${color}`}>
          {extension.length <= 4 && (
            <span className="file-ext">{extension}</span>
          )}
        </div>
        {shouldSpinnerRender && (
          <div className={buildClassName('file-progress', color, spinnerClassNames)}>
            <ProgressSpinner progress={transferProgress} smaller onClick={onCancelTransfer} />
          </div>
        )}
      </div>
      <div className="file-info">
        <div className="file-name">{name}</div>
        <div className="file-size">
          {isUploading && transferProgress ? `${Math.round(transferProgress * 100)}%` : sizeString}
        </div>
      </div>
    </div>
  );
};

export default File;
