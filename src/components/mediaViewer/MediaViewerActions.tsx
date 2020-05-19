import React, { FC } from '../../lib/teact/teact';

import Button from '../ui/Button';

import './MediaViewerActions.scss';

type OwnProps = {
  blobUrl?: string;
  fileName?: string;
  isAvatar?: boolean;
  onCloseMediaViewer: Function;
  onForward: Function;
};

const MediaViewerActions: FC<OwnProps> = ({
  blobUrl, fileName, isAvatar, onCloseMediaViewer, onForward,
}) => {
  return (
    <div className="MediaViewerActions">
      {!isAvatar && (
        <>
          <Button
            round
            ripple
            size="smaller"
            color="translucent-white"
            ariaLabel="Delete"
            className="not-implemented"
          >
            <i className="icon-delete" />
          </Button>
          <Button
            round
            size="smaller"
            color="translucent-white"
            ariaLabel="Forward"
            onClick={onForward}
          >
            <i className="icon-forward" />
          </Button>
        </>
      )}
      <Button
        href={blobUrl}
        download={fileName}
        round
        ripple
        size="smaller"
        color="translucent-white"
        ariaLabel="Download"
      >
        <i className="icon-download" />
      </Button>
      <Button
        round
        size="smaller"
        color="translucent-white"
        ariaLabel="Close"
        onClick={onCloseMediaViewer}
      >
        <i className="icon-close" />
      </Button>
    </div>
  );
};

export default MediaViewerActions;
