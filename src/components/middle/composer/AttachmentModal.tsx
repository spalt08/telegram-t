import React, {
  FC, memo, useCallback, useEffect,
} from '../../../lib/teact/teact';

import { ApiAttachment } from '../../../api/types';

import { getFileExtension } from '../../common/helpers/documentInfo';
import captureEscKeyListener from '../../../util/captureEscKeyListener';
import usePrevious from '../../../hooks/usePrevious';

import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import File from '../../common/File';
import MessageInput from './MessageInput';

import './AttachmentModal.scss';

export type OwnProps = {
  attachments: ApiAttachment[];
  caption: string;
  onCaptionUpdate: (html: string) => void;
  onSend: () => void;
  onClear: () => void;
};

const AttachmentModal: FC<OwnProps> = ({
  attachments, caption, onCaptionUpdate, onSend, onClear,
}) => {
  const prevAttachments = usePrevious(attachments);
  const renderingAttachments = attachments.length ? attachments : prevAttachments;
  const isOpen = Boolean(attachments.length);

  useEffect(() => (isOpen ? captureEscKeyListener(onClear) : undefined), [isOpen, onClear]);

  const sendAttachments = useCallback(() => {
    if (isOpen) {
      onSend();
    }
  }, [isOpen, onSend]);

  if (!renderingAttachments) {
    return undefined;
  }

  const areAllPhotos = renderingAttachments.every((a) => a.mimeType.startsWith('image/'));
  const areAllVideos = renderingAttachments.every((a) => a.mimeType.startsWith('video/'));

  let title = '';
  if (areAllPhotos) {
    title = renderingAttachments.length === 1 ? 'Send Photo' : `Send ${renderingAttachments.length} Photos`;
  } else if (areAllVideos) {
    title = renderingAttachments.length === 1 ? 'Send Video' : `Send ${renderingAttachments.length} Videos`;
  } else {
    title = renderingAttachments.length === 1 ? 'Send File' : `Send ${renderingAttachments.length} Files`;
  }

  const isQuick = renderingAttachments.every((a) => a.quick);

  function renderHeader() {
    if (!renderingAttachments) {
      return undefined;
    }

    return (
      <div className="modal-header-condensed">
        <Button round color="translucent" size="smaller" ariaLabel="Cancel attachments" onClick={onClear}>
          <i className="icon-close" />
        </Button>
        <div className="modal-title">{title}</div>
        <Button
          color="primary"
          size="smaller"
          className="modal-action-button"
          onClick={sendAttachments}
        >
          Send
        </Button>
      </div>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClear} header={renderHeader()} className="AttachmentModal">
      {isQuick ? (
        <div className="media-wrapper custom-scroll">
          {renderingAttachments.map((attachment) => (
            attachment.mimeType.startsWith('image/')
              ? <img src={attachment.blobUrl} alt="" />
              : <video src={attachment.blobUrl} autoPlay muted loop />
          ))}
        </div>
      ) : (
        <div className="document-wrapper custom-scroll">
          {renderingAttachments.map((attachment) => (
            <File
              name={attachment.filename}
              extension={getFileExtension(attachment.filename, attachment.mimeType)}
              previewData={attachment.previewBlobUrl}
              size={attachment.size}
              smaller
            />
          ))}
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
    </Modal>
  );
};

export default memo(AttachmentModal);
