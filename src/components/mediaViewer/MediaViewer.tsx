import React, {
  FC, useEffect, memo, useCallback,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../store/types';
import { ApiMessage } from '../../api/types';

import { selectChatMessage, selectChatMessages } from '../../modules/selectors';
import {
  getChatMediaMessageIds,
  getMessagePhoto,
  getMessageVideo,
  getMessageMediaHash,
  getMessageMediaThumbDataUri,
  getVideoDimensions,
  IDimensions,
} from '../../modules/helpers';
import { buildMessageContent } from '../middle/message/util/buildMessageContent';
import captureEscKeyListener from '../../util/captureEscKeyListener';
import usePrevious from '../../hooks/usePrevious';
import useMedia from '../../hooks/useMedia';

import Spinner from '../ui/Spinner';
import AnimationFade from '../ui/AnimationFade';
import SenderInfo from './SenderInfo';
import MediaViewerActions from './MediaViewerActions';
import MediaViewerFooter from './MediaViewerFooter';
import VideoPlayer from './VideoPlayer';

import './MediaViewer.scss';

type IProps = Pick<GlobalActions, 'selectMediaMessage'> & {
  chatId?: number;
  selectedMediaMessageId?: number;
  message: ApiMessage;
  chatMessages: Record<number, ApiMessage>;
};

const MediaViewer: FC<IProps> = ({
  chatId,
  selectedMediaMessageId,
  message,
  chatMessages,
  selectMediaMessage,
}) => {
  const messageIds = getChatMediaMessageIds(chatMessages || {});
  const selectedMediaMessageIndex = selectedMediaMessageId && messageIds.indexOf(selectedMediaMessageId);
  const isFirst = selectedMediaMessageIndex === undefined || selectedMediaMessageIndex === 0;
  const isLast = selectedMediaMessageIndex === undefined || selectedMediaMessageIndex === messageIds.length - 1;
  const isOpen = Boolean(selectedMediaMessageId);

  let { text: messageText } = message ? buildMessageContent(message) : { text: undefined };
  let isPhoto = message ? Boolean(getMessagePhoto(message)) : null;
  let isVideo = message ? Boolean(getMessageVideo(message)) : null;

  const thumbDataUri = message && getMessageMediaThumbDataUri(message);
  let blobUrlPreview = useMedia(message && getMessageMediaHash(message, 'viewerPreview'));
  let blobUrlFull = useMedia(message && getMessageMediaHash(message, 'viewerFull'));

  // For correct unmount animation
  const previousProps = usePrevious({
    message,
    chatId,
    selectedMediaMessageId,
    messageText,
    isPhoto,
    isVideo,
    blobUrlFull,
    blobUrlPreview,
  });

  if (!isOpen && previousProps) {
    message = previousProps.message;
    chatId = previousProps.chatId;
    selectedMediaMessageId = previousProps.selectedMediaMessageId;
    messageText = previousProps.messageText;
    isPhoto = previousProps.isPhoto;
    isVideo = previousProps.isVideo;
    blobUrlFull = previousProps.blobUrlFull;
    blobUrlPreview = previousProps.blobUrlPreview;
  }

  const getMessageId = (fromId: number, direction: number): number => {
    let index = messageIds.indexOf(fromId);
    if ((direction === -1 && index > 0) || (direction === 1 && index < messageIds.length - 1)) {
      index += direction;
    }

    return messageIds[index];
  };

  const closeMediaViewer = useCallback(() => {
    selectMediaMessage({ id: null });
  }, [selectMediaMessage]);

  useEffect(() => (isOpen ? captureEscKeyListener(closeMediaViewer) : undefined), [closeMediaViewer, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Left': // IE/Edge specific value
        case 'ArrowLeft':
          selectPreviousMedia();
          break;

        case 'Right': // IE/Edge specific value
        case 'ArrowRight':
          selectNextMedia();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown, false);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, false);
    };
  });

  function handleClose(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    e.stopPropagation();
    const { classList } = e.target as HTMLElement;

    if (!classList.contains('navigation') || classList.contains('media-viewer-footer')) {
      closeMediaViewer();
    }
  }

  function stopEvent(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.stopPropagation();
  }

  function selectPreviousMedia() {
    selectMediaMessage({ id: selectedMediaMessageId ? getMessageId(selectedMediaMessageId, -1) : null });
  }

  function selectNextMedia() {
    selectMediaMessage({ id: selectedMediaMessageId ? getMessageId(selectedMediaMessageId, 1) : null });
  }

  return (
    <AnimationFade show={isOpen}>
      <div id="MediaViewer" onClick={handleClose}>
        <div className="media-viewer-head" onClick={stopEvent}>
          <SenderInfo chatId={chatId} messageId={selectedMediaMessageId} />
          <MediaViewerActions onCloseMediaViewer={closeMediaViewer} />
        </div>
        <div className="media-viewer-content">
          {isPhoto && renderPhoto(blobUrlFull || blobUrlPreview)}
          {isVideo && renderVideo(
            blobUrlFull,
            blobUrlPreview || thumbDataUri,
            getVideoDimensions(message.content.video!),
          )}
          {!isFirst && (
            <button
              type="button"
              className="navigation prev"
              aria-label="Previous"
              onClick={selectPreviousMedia}
            />
          )}
          {!isLast && (
            <button
              type="button"
              className="navigation next"
              aria-label="Next"
              onClick={selectNextMedia}
            />
          )}
        </div>
        {messageText && <MediaViewerFooter text={messageText} />}
      </div>
    </AnimationFade>
  );
};

function renderPhoto(blobUrl?: string) {
  return blobUrl ? <img src={blobUrl} alt="" /> : <Spinner color="white" />;
}

function renderVideo(blobUrl?: string, posterData?: string, posterSize?: IDimensions) {
  if (blobUrl) {
    return <VideoPlayer key={blobUrl} url={blobUrl} />;
  } else {
    if (posterData && posterSize) {
      return (
        <div className="thumbnail">
          <img
            src={posterData}
            alt=""
            width={posterSize.width}
            height={posterSize.height}
          />
          <Spinner color="white" />
        </div>
      );
    }

    return <Spinner color="white" />;
  }
}

export default memo(withGlobal(
  (global) => {
    const { chats: { selectedId: selectedChatId }, messages: { selectedMediaMessageId } } = global;
    if (!selectedChatId || !selectedMediaMessageId) {
      return {};
    }

    const chatMessages = selectChatMessages(global, selectedChatId);
    const message = selectChatMessage(global, selectedChatId, selectedMediaMessageId);

    if (!message) {
      return {};
    }

    return {
      chatId: message && message.chat_id,
      selectedMediaMessageId,
      message,
      chatMessages,
    };
  },
  (setGlobal, actions) => {
    const { selectMediaMessage } = actions;
    return { selectMediaMessage };
  },
)(MediaViewer));
