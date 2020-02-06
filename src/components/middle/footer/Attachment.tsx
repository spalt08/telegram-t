import React, { FC, useCallback, useEffect } from '../../../lib/teact/teact';

import { ApiAttachment } from '../../../api/types';

import { getFileExtension } from '../../../util/documentInfo';
import captureEscKeyListener from '../../../util/captureEscKeyListener';
import usePrevious from '../../../hooks/usePrevious';

import Button from '../../ui/Button';
import Dialog from '../../ui/Dialog';
import InputText from '../../ui/InputText';
import File from '../../common/File';

import './Attachment.scss';

type IProps = {
  attachment?: ApiAttachment;
  caption?: string;
  onCaptionUpdate: (caption: string) => void;
  onSend: () => void;
  onClear: () => void;
};

const Attachment: FC<IProps> = ({
  attachment, caption, onCaptionUpdate, onSend, onClear,
}) => {
  const prevAttachment = usePrevious(attachment);
  const isOpen = Boolean(attachment);
  const renderingAttachment = attachment || prevAttachment;

  useEffect(() => captureEscKeyListener(onClear), [onClear]);

  const sendAttachment = useCallback(() => {
    if (isOpen) {
      onSend();
    }
  }, [isOpen, onSend]);

  function handleCaptionChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;

    onCaptionUpdate(value);
  }

  function handleCaptionKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      sendAttachment();
    }
  }

  function renderHeader() {
    if (!renderingAttachment) {
      return null;
    }

    return (
      <div className="AttachmentHeader">
        <Button round color="translucent" size="smaller" ariaLabel="Cancel attachment" onClick={onClear}>
          <i className="icon-close" />
        </Button>
        <div className="caption">{renderingAttachment.photo ? 'Send Photo' : 'Send File'}</div>
        <Button color="primary" size="smaller" className="send" onClick={sendAttachment}>Send</Button>
      </div>
    );
  }

  if (!renderingAttachment) {
    return null;
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClear} header={renderHeader()} className="Attachment">
      {renderingAttachment.photo && (
        <div className="image-wrapper">
          <img src={renderingAttachment.photo.blobUrl} alt="" />
        </div>
      )}
      {!renderingAttachment.photo && (
        <div className="document-wrapper">
          <File
            name={renderingAttachment.file.name}
            extension={getFileExtension(renderingAttachment.file.name, renderingAttachment.file.type)}
            size={renderingAttachment.file.size}
            smaller
          />
        </div>
      )}

      <InputText
        placeholder="Add a caption..."
        value={caption}
        onChange={handleCaptionChange}
        onKeyPress={handleCaptionKeyPress}
      />
    </Dialog>
  );
};

export default Attachment;
