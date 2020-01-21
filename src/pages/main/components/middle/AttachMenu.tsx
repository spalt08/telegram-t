import React, { FC } from '../../../../lib/teact';

import { openSystemFileDialog } from '../../../../util/systemFileDialog';

import Menu from '../../../../components/ui/Menu';
import MenuItem from '../../../../components/ui/MenuItem';

import './AttachMenu.scss';

type IProps = {
  isOpen: boolean;
  onMediaChoose: (file: File) => void;
  onClose: () => void;
};

const AttachMenu: FC<IProps> = ({ isOpen, onMediaChoose, onClose }) => {
  const handleMediaChoose = (e: Event) => {
    const { files } = (e.target as HTMLInputElement);

    if (files && files.length > 0) {
      onMediaChoose(files[0]);
    }
  };

  const handleFileSelect = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    openSystemFileDialog('image/png,image/gif,image/jpeg', handleMediaChoose);
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
      <MenuItem icon="photo" onClick={handleFileSelect}>Photo or Video</MenuItem>
      <MenuItem className="not-implemented" icon="document">Document</MenuItem>
    </Menu>
  );
};

export default AttachMenu;
