import React, { FC, useMemo } from '../../lib/teact/teact';

import { IS_MOBILE_SCREEN } from '../../util/environment';

import Button from '../ui/Button';
import DropdownMenu from '../ui/DropdownMenu';
import MenuItem from '../ui/MenuItem';

import './MediaViewerActions.scss';

type OwnProps = {
  blobUrl?: string;
  fileName?: string;
  isAvatar?: boolean;
  onCloseMediaViewer: NoneToVoidFunction;
  onForward: NoneToVoidFunction;
};

const MediaViewerActions: FC<OwnProps> = ({
  blobUrl,
  fileName,
  isAvatar,
  onCloseMediaViewer,
  onForward,
}) => {
  const MenuButton: FC<{ onTrigger: () => void; isOpen?: boolean }> = useMemo(() => {
    return ({ onTrigger, isOpen }) => (
      <Button
        round
        ripple
        size="smaller"
        color="translucent"
        className={isOpen ? 'active' : undefined}
        onClick={onTrigger}
        ariaLabel="More actions"
      >
        <i className="icon-more" />
      </Button>
    );
  }, []);

  if (IS_MOBILE_SCREEN) {
    return (
      <DropdownMenu
        trigger={MenuButton}
        positionX="right"
      >
        {!isAvatar && (
          <MenuItem
            icon="forward"
            onClick={onForward}
          >
            Forward
          </MenuItem>
        )}
        <MenuItem
          icon="download"
          href={blobUrl}
          download={fileName}
        >
          Download
        </MenuItem>
        {!isAvatar && (
          <MenuItem
            className="not-implemented"
            icon="delete"
            destructive
          >
            Delete
          </MenuItem>
        )}
      </DropdownMenu>
    );
  }

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
