import React, {
  FC, useCallback, useEffect, useRef,
} from '../../../lib/teact/teact';

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

let isJustSent = false;

const Attachment: FC<IProps> = ({
  attachment, caption, onCaptionUpdate, onSend, onClear,
}) => {
  const prevAttachment = usePrevious(attachment);
  const renderingAttachment = attachment || prevAttachment;
  const isOpen = Boolean(attachment);
  const inputRef = useRef<HTMLInputElement>();
  const photo = renderingAttachment && renderingAttachment.file.type.startsWith('image/') && renderingAttachment.quick;

  function focusInput() {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }

  useEffect(() => captureEscKeyListener(onClear), [onClear]);
  useEffect(focusInput, [isOpen]);

  const sendAttachment = useCallback(() => {
    if (isOpen) {
      onSend();
    }
  }, [isOpen, onSend]);

  function handleCaptionChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isJustSent) {
      isJustSent = false;
      return;
    }

    const { value } = e.target;

    onCaptionUpdate(value);
  }

  function handleCaptionKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      sendAttachment();

      // Disable `onChange` following immediately after `onKeyPress`.
      isJustSent = true;
      setTimeout(() => {
        isJustSent = false;
      }, 0);
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
        <div className="caption">{photo ? 'Send Photo' : 'Send File'}</div>
        <Button color="primary" size="smaller" className="send" onClick={sendAttachment}>Send</Button>
      </div>
    );
  }

  if (!renderingAttachment) {
    return null;
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClear} header={renderHeader()} className="Attachment">
      {photo && (
        <div className="image-wrapper">
          <img src={photo.blobUrl} alt="" />
        </div>
      )}
      {!photo && (
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
        ref={inputRef}
        placeholder="Add a caption..."
        value={caption}
        onChange={handleCaptionChange}
        onKeyPress={handleCaptionKeyPress}
      />
    </Dialog>
  );
};

export default Attachment;
