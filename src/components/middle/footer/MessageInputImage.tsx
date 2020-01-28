import React, { FC, useEffect, useState } from '../../../lib/teact/teact';

import { preloadImage } from '../../../util/image';
import captureEscKeyListener from '../../../util/captureEscKeyListener';

import Button from '../../ui/Button';

import './MessageInputImage.scss';

type IProps = {
  image: File;
  onClearImage: () => void;
};

const MessageInputImage: FC<IProps> = ({ image, onClearImage }) => {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (image) {
      const newBlobUrl = URL.createObjectURL(image);
      preloadImage(newBlobUrl).then(() => {
        setBlobUrl(newBlobUrl);
      });
    }
  }, [image]);

  useEffect(() => captureEscKeyListener(onClearImage), [onClearImage]);

  return (
    <div className={`MessageInputImage${blobUrl ? ' loaded' : ''}`}>
      <div className="image-wrapper" id="messageInputImage">
        {blobUrl && <img src={blobUrl} alt="" />}
      </div>
      <Button round color="translucent" ariaLabel="Cancel sending clipboard image" onClick={onClearImage}>
        <i className="icon-close" />
      </Button>
    </div>
  );
};

export default MessageInputImage;
