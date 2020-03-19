import React, { FC } from '../../lib/teact/teact';

import Button from '../ui/Button';
import './MediaViewerActions.scss';

type IProps = {
  onCloseMediaViewer: Function;
  onForward: Function;
};

const MediaViewerActions: FC<IProps> = ({ onCloseMediaViewer, onForward }) => {
  return (
    <div className="MediaViewerActions">
      <Button round size="smaller" color="translucent-white" ariaLabel="Delete" className="not-implemented">
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
      <Button round size="smaller" color="translucent-white" ariaLabel="Download" className="not-implemented">
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
