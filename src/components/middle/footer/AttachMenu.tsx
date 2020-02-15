import React, {
  FC, memo, useRef, useCallback,
} from '../../../lib/teact/teact';

import { openSystemFileDialog } from '../../../util/systemFileDialog';

import Menu from '../../ui/Menu';
import MenuItem from '../../ui/MenuItem';

import './AttachMenu.scss';

type IProps = {
  isOpen: boolean;
  onFileSelect: (file: File, isQuick: boolean) => void;
  onClose: () => void;
};

const MENU_CLOSE_TIMEOUT = 250;
let closeTimeout: NodeJS.Timeout | null = null;

const AttachMenu: FC<IProps> = ({ isOpen, onFileSelect, onClose }) => {
  const isMouseInside = useRef(false);

  const handleMouseEnter = useCallback(() => {
    isMouseInside.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isMouseInside.current = false;
    if (closeTimeout) {
      clearTimeout(closeTimeout);
    }
    closeTimeout = setTimeout(() => {
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

  return (
    <Menu
      isOpen={isOpen}
      autoClose
      positionX="right"
      positionY="bottom"
      onClose={onClose}
      className="AttachMenu"
      onCloseAnimationEnd={onClose}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      noCloseOnBackdrop
    >
      <MenuItem icon="photo" onClick={handleQuickSelect}>Photo or Video</MenuItem>
      <MenuItem icon="document" onClick={handleDocumentSelect}>Document</MenuItem>
      <MenuItem icon="poll" className="not-implemented">Poll</MenuItem>
    </Menu>
  );
};

export default memo(AttachMenu);
