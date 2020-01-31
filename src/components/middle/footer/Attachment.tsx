import React, { FC, useEffect } from '../../../lib/teact/teact';

import { ApiAttachment } from '../../../api/types';

import captureEscKeyListener from '../../../util/captureEscKeyListener';

import Button from '../../ui/Button';

import './Attachment.scss';

type IProps = {
  attachment: ApiAttachment;
  onClearFile: () => void;
};

const Attachment: FC<IProps> = ({ attachment, onClearFile }) => {
  useEffect(() => captureEscKeyListener(onClearFile), [onClearFile]);

  return (
    <div className="Attachment">
      {attachment.photo ? (
        <div className="image-wrapper">
          <img src={attachment.photo.blobUrl} alt="" />
        </div>
      ) : (
        <div className="document-wrapper">{attachment.file.name}</div>
      )}
      <Button round color="translucent" ariaLabel="Cancel attachment" onClick={onClearFile}>
        <i className="icon-close" />
      </Button>
    </div>
  );
};

export default Attachment;
