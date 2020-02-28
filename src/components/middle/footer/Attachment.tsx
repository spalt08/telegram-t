import React, {
  FC, memo, useCallback, useEffect,
} from '../../../lib/teact/teact';

import { ApiAttachment } from '../../../api/types';

import { getFileExtension } from '../../../util/documentInfo';
import captureEscKeyListener from '../../../util/captureEscKeyListener';
import usePrevious from '../../../hooks/usePrevious';

import Button from '../../ui/Button';
import Dialog from '../../ui/Dialog';
import File from '../../common/File';
import MessageInput from './MessageInput';

import './Attachment.scss';

type IProps = {
  attachment?: ApiAttachment;
  caption?: string;
  onCaptionUpdate: (html: string) => void;
  onSend: () => void;
  onClear: () => void;
};

const Attachment: FC<IProps> = ({
  attachment, caption, onCaptionUpdate, onSend, onClear,
}) => {
  const prevAttachment = usePrevious(attachment);
  const renderingAttachment = attachment || prevAttachment;
  const isOpen = Boolean(attachment);
  const photo = renderingAttachment && renderingAttachment.file.type.startsWith('image/') && renderingAttachment.quick;
  const video = renderingAttachment && renderingAttachment.file.type.startsWith('video/') && renderingAttachment.quick;

  useEffect(() => (isOpen ? captureEscKeyListener(onClear) : undefined), [isOpen, onClear]);

  const sendAttachment = useCallback(() => {
    if (isOpen) {
      onSend();
    }
  }, [isOpen, onSend]);

  function renderHeader() {
    if (!renderingAttachment) {
      return null;
    }

    return (
      <div className="AttachmentHeader">
        <Button round color="translucent" size="smaller" ariaLabel="Cancel attachment" onClick={onClear}>
          <i className="icon-close" />
        </Button>
        <div className="caption">{photo ? 'Send Photo' : video ? 'Send Video' : 'Send File'}</div>
        <Button color="primary" size="smaller" className="send" onClick={sendAttachment}>Send</Button>
      </div>
    );
  }

  if (!renderingAttachment) {
    return null;
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClear} header={renderHeader()} className="Attachment">
      {(photo || video) && (
        <div className="media-wrapper">
          {photo && <img src={photo.blobUrl} alt="" />}
          {video && <video src={video.blobUrl} autoPlay muted loop />}
        </div>
      )}
      {!photo && !video && (
        <div className="document-wrapper">
          <File
            name={renderingAttachment.file.name}
            extension={getFileExtension(renderingAttachment.file.name, renderingAttachment.file.type)}
            size={renderingAttachment.file.size}
            smaller
          />
        </div>
      )}

      <MessageInput
        id="caption-input-text"
        html={caption}
        placeholder="Add a caption..."
        onUpdate={onCaptionUpdate}
        onSend={onSend}
        shouldSetFocus={isOpen}
      />
    </Dialog>
  );
};

export default memo(Attachment);
