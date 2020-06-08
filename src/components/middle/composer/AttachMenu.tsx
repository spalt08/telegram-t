import React, {
  FC, memo, useRef, useCallback, useEffect,
} from '../../../lib/teact/teact';

import { openSystemFileDialog } from '../../../util/systemFileDialog';
import { IAllowedAttachmentOptions } from '../../../modules/helpers';
import { IS_TOUCH_ENV } from '../../../util/environment';

import Menu from '../../ui/Menu';
import MenuItem from '../../ui/MenuItem';

import './AttachMenu.scss';

export type OwnProps = {
  isOpen: boolean;
  allowedAttachmentOptions: IAllowedAttachmentOptions;
  onFileSelect: (file: File, isQuick: boolean) => void;
  onPollCreate: () => void;
  onClose: () => void;
};

const MENU_CLOSE_TIMEOUT = 250;
let closeTimeout: number | undefined;

const AttachMenu: FC<OwnProps> = ({
  isOpen, allowedAttachmentOptions, onFileSelect, onPollCreate, onClose,
}) => {
  const isMouseInside = useRef(false);

  useEffect(() => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = undefined;
    }
    if (isOpen && !IS_TOUCH_ENV) {
      closeTimeout = window.setTimeout(() => {
        if (!isMouseInside.current) {
          onClose();
        }
      }, MENU_CLOSE_TIMEOUT * 2);
    }
  }, [isOpen, onClose]);

  const handleMouseEnter = useCallback(() => {
    isMouseInside.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isMouseInside.current = false;
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = undefined;
    }
    closeTimeout = window.setTimeout(() => {
      if (!isMouseInside.current) {
        onClose();
      }
    }, MENU_CLOSE_TIMEOUT);
  }, [onClose]);

  const handleFileSelect = (e: Event, isQuick: boolean) => {
    const { files } = e.target as HTMLInputElement;

    if (files && files.length > 0) {
      onFileSelect(files[0], isQuick);
    }
  };

  const handleQuickSelect = () => {
    openSystemFileDialog(
      'image/png,image/gif,image/jpeg,video/mp4,video/avi,video/quicktime',
      (e) => handleFileSelect(e, true),
    );
  };

  const handleDocumentSelect = () => {
    openSystemFileDialog('*', (e) => handleFileSelect(e, false));
  };

  const { canAttachMedia, canAttachPolls } = allowedAttachmentOptions;

  return (
    <Menu
      isOpen={isOpen}
      autoClose
      positionX="right"
      positionY="bottom"
      onClose={onClose}
      className="AttachMenu"
      onCloseAnimationEnd={onClose}
      onMouseEnter={!IS_TOUCH_ENV ? handleMouseEnter : undefined}
      onMouseLeave={!IS_TOUCH_ENV ? handleMouseLeave : undefined}
      noCloseOnBackdrop={!IS_TOUCH_ENV}
    >
      {/*
       ** Using ternary operator here causes some attributes from first clause
       ** transferring to the fragment content in the second clause
       */}
      {!canAttachMedia && (
        <MenuItem className="media-disabled" disabled>Posting media content is not allowed in this group.</MenuItem>
      )}
      {canAttachMedia && (
        <>
          <MenuItem icon="photo" onClick={handleQuickSelect}>Photo or Video</MenuItem>
          <MenuItem icon="document" onClick={handleDocumentSelect}>Document</MenuItem>
        </>
      )}
      {canAttachPolls && (
        <MenuItem icon="poll" onClick={onPollCreate}>Poll</MenuItem>
      )}
    </Menu>
  );
};

export default memo(AttachMenu);
