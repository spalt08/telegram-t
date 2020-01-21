import React, { FC, useEffect, useState } from '../../../../lib/teact';

import { getImageData } from '../../../../util/image';

import Button from '../../../../components/ui/Button';
import './MessageInputImage.scss';

type IProps = {
  image: File;
  onClearImage: () => void;
};

const MessageInputImage: FC<IProps> = ({ image, onClearImage }) => {
  const [imageDataUri, setImageDataUri] = useState(null);

  useEffect(() => {
    if (image) {
      getImageData(image)
        .then((imageData) => setImageDataUri(imageData.url));
    }
  }, [image]);

  if (!image) {
    return null;
  }

  return (
    <div className={`MessageInputImage${imageDataUri !== null ? ' loaded' : ''}`}>
      <div className="image-wrapper" id="messageInputImage">
        {imageDataUri && <img src={imageDataUri} alt="" />}
      </div>
      <Button round color="translucent" ariaLabel="Cancel sending clipboard image" onClick={onClearImage}>
        <i className="icon-close" />
      </Button>
    </div>
  );
};


export default MessageInputImage;
