import { ChangeEvent } from 'react';
import React, { FC, useState } from '../../lib/teact/teact';

import CropModal from './CropModal';

import './AvatarEditable.scss';

interface OwnProps {
  title?: string;
  currentAvatarBlobUrl?: string;
  onChange: (file: File) => void;
}

const AvatarEditable: FC<OwnProps> = ({
  title = 'Change your profile picture',
  currentAvatarBlobUrl,
  onChange,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [croppedBlobUrl, setCroppedBlobUrl] = useState<string | undefined>(currentAvatarBlobUrl);

  function handleSelectFile(event: ChangeEvent<HTMLInputElement>) {
    const target = event.target as HTMLInputElement;

    if (!target || !target.files || !target.files[0]) {
      return;
    }

    setSelectedFile(target.files[0]);
    target.value = '';
  }

  function handleAvatarCrop(croppedImg: File) {
    setSelectedFile(undefined);
    onChange(croppedImg);

    if (croppedBlobUrl) {
      URL.revokeObjectURL(croppedBlobUrl);
    }
    setCroppedBlobUrl(URL.createObjectURL(croppedImg));
  }

  function handleModalClose() {
    setSelectedFile(undefined);
  }

  return (
    <div className="AvatarEditable">
      <label
        className={croppedBlobUrl ? 'filled' : ''}
        role="button"
        tabIndex={0}
        title={title}
      >
        <input
          type="file"
          onChange={handleSelectFile}
          accept="image/png, image/jpeg"
        />
        <i className="icon-camera-add" />
        {croppedBlobUrl && <img src={croppedBlobUrl} alt="Avatar" />}
      </label>
      <CropModal file={selectedFile} onClose={handleModalClose} onChange={handleAvatarCrop} />
    </div>
  );
};

export default AvatarEditable;
