import React, { FC } from '../../../lib/teact/teact';

import { openSystemFileDialog } from '../../../util/systemFileDialog';

import Menu from '../../ui/Menu';
import MenuItem from '../../ui/MenuItem';

import './AttachMenu.scss';

type IProps = {
  isOpen: boolean;
  onFileSelect: (file: File, asPhoto: boolean) => void;
  onClose: () => void;
};

const AttachMenu: FC<IProps> = ({ isOpen, onFileSelect, onClose }) => {
  const handleFileSelect = (e: Event, asPhoto: boolean) => {
    const { files } = e.target as HTMLInputElement;

    if (files && files.length > 0) {
      onFileSelect(files[0], asPhoto);
    }
  };

  const handlePhotoSelect = () => {
    openSystemFileDialog('image/png,image/gif,image/jpeg', (e) => handleFileSelect(e, true));
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
    >
      <MenuItem icon="photo" onClick={handlePhotoSelect}>Photo</MenuItem>
      <MenuItem icon="document" onClick={handleDocumentSelect}>Document</MenuItem>
    </Menu>
  );
};

export default AttachMenu;
