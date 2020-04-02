import React, { FC, useEffect, useState } from '../../lib/teact/teact';

import { DEBUG } from '../../config';
import { blobToFile, blobToDataUri } from '../../util/files';

import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Loading from '../ui/Loading';

import './CropModal.scss';

// Change to 'base64' to get base64-encoded string
const cropperResultOptions: Croppie.ResultOptions & { type: 'blob' } = {
  type: 'blob',
  quality: 0.8,
  format: 'jpeg',
  circle: false,
};

let Croppie: typeof import('croppie');
let cropper: Croppie;

async function requireCroppie() {
  try {
    [Croppie] = await Promise.all([
      // For some reason the type checker expects module to be imported within `default` namespace,
      // but in fact it is imported directly.
      import('croppie') as unknown as typeof import('croppie'),
      // @ts-ignore
      import('croppie/croppie.css'),
    ]);

    return true;
  } catch (err) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error(err);
    }

    return false;
  }
}

async function processFile(imgFile: File) {
  try {
    const cropContainer = document.getElementById('avatar-crop');
    if (!cropContainer) {
      return;
    }

    const { offsetWidth, offsetHeight } = cropContainer;

    cropper = new Croppie(cropContainer, {
      enableZoom: false,
      boundary: {
        width: offsetWidth,
        height: offsetHeight,
      },
      viewport: {
        width: offsetWidth * 0.9,
        height: offsetHeight * 0.9,
        type: 'circle',
      },
    });

    const dataUri = await blobToDataUri(imgFile);
    await cropper.bind({ url: dataUri });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
}

type OwnProps = {
  file: File;
  onChange: Function;
  onClose: () => void;
};

const CropModal: FC<OwnProps> = ({ file, onChange, onClose }: OwnProps) => {
  const [isCroppieReady, setIsCroppieReady] = useState(false);

  useEffect(() => {
    if (!file) {
      return;
    }

    if (!isCroppieReady) {
      requireCroppie().then(setIsCroppieReady);
      return;
    }

    void processFile(file);
  }, [isCroppieReady, file]);

  async function cropAvatar() {
    if (!cropper) {
      return;
    }

    const result: Blob | string = await cropper.result(cropperResultOptions);
    const croppedImg = typeof result === 'string' ? result : blobToFile(result, 'avatar.jpg');

    onChange(croppedImg);
  }

  return (
    <Modal
      isOpen={Boolean(file)}
      onClose={onClose}
      title="Drag to reposition"
      className="CropModal"
      showCloseButton
    >
      {isCroppieReady ? (
        <div id="avatar-crop" />
      ) : (
        <Loading />
      )}
      <Button className="confirm-button" round color="primary" onClick={cropAvatar}>
        <i className="icon-check" />
      </Button>
    </Modal>
  );
};

export default CropModal;
