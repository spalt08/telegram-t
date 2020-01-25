import React, {
  FC, useEffect, useState, memo, useCallback,
} from '../../lib/teact/teact';
import usePrevious from '../../hooks/usePrevious';
import { withGlobal } from '../../lib/teact/teactn';
import { selectChatMessage, selectChatMessages } from '../../modules/selectors';
import { GlobalActions } from '../../store/types';
import { getChatMediaMessageIds, getMessageMediaHash } from '../../modules/helpers';
import * as mediaLoader from '../../util/mediaLoader';
import { buildMessageContent } from '../middle/message/util/buildMessageContent';
import { ApiMessage, ApiMiniThumbnail } from '../../api/types';
import captureEscKeyListener from '../../util/captureEscKeyListener';

import Spinner from '../ui/Spinner';
import AnimationFade from '../ui/AnimationFade';
import SenderInfo from './SenderInfo';
import MediaViewerActions from './MediaViewerActions';
import MediaViewerFooter from './MediaViewerFooter';
import VideoPlayer from './VideoPlayer';

import './MediaViewer.scss';

type IPhotoRenderProps = {
  selectedMediaMessageId?: number;
  blobUrl?: string;
  previousBlobUrl?: string;
};

type IVideoRenderProps = IPhotoRenderProps & {
  poster?: ApiMiniThumbnail;
};

type IProps = Pick<GlobalActions, 'selectMediaMessage'> & {
  chatId?: number;
  selectedMediaMessageId?: number;
  isPhoto: boolean;
  isVideo: boolean;
  mediaHash?: string;
  messageText?: string;
  chatMessages: Record<number, ApiMessage>;
  poster?: ApiMiniThumbnail;
};

const MediaViewer: FC<IProps> = ({
  chatId, selectedMediaMessageId, isPhoto, isVideo, mediaHash, messageText, chatMessages, selectMediaMessage, poster,
}) => {
  const messageIds = getChatMediaMessageIds(chatMessages || {});
  const selectedMediaMessageIndex = selectedMediaMessageId && messageIds.indexOf(selectedMediaMessageId);
  const isFirst = selectedMediaMessageIndex === undefined || selectedMediaMessageIndex === 0;
  const isLast = selectedMediaMessageIndex === undefined || selectedMediaMessageIndex === messageIds.length - 1;
  const isOpen = Boolean(selectedMediaMessageId);

  const [, onBlobUrlUpdate] = useState(null);
  const blobUrl = mediaHash ? mediaLoader.getFromMemory<string>(mediaHash) : undefined;

  // For correct unmount animation
  const previousProps = usePrevious({
    blobUrl,
    messageText,
    chatId,
    selectedMediaMessageId,
  });

  const {
    blobUrl: previousBlobUrl,
    messageText: previousMessageText,
    chatId: previousChatId,
    selectedMediaMessageId: previousMediaMessageId,
  } = previousProps;

  useEffect(() => {
    if (mediaHash && !blobUrl) {
      mediaLoader.fetch(mediaHash, mediaLoader.Type.BlobUrl).then(onBlobUrlUpdate);
    }
  }, [mediaHash, blobUrl]);

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
          <SenderInfo chatId={chatId || previousChatId} messageId={selectedMediaMessageId || previousMediaMessageId} />
          <MediaViewerActions onCloseMediaViewer={closeMediaViewer} />
        </div>
        <div className="media-viewer-content">
          {isVideo && renderVideo({
            selectedMediaMessageId, blobUrl, previousBlobUrl, poster,
          })}
          {isPhoto && renderPhoto({ selectedMediaMessageId, blobUrl, previousBlobUrl })}
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
        <MediaViewerFooter text={selectedMediaMessageId ? messageText : previousMessageText} />
      </div>
    </AnimationFade>
  );
};

function renderVideo({
  selectedMediaMessageId, blobUrl, previousBlobUrl, poster,
}: IVideoRenderProps) {
  if (selectedMediaMessageId && blobUrl) {
    return <VideoPlayer key={blobUrl} url={blobUrl} />;
  }

  if (selectedMediaMessageId && !blobUrl) {
    if (poster) {
      return (
        <div className="video-thumbnail">
          <img src={`data:image/jpeg;base64, ${poster.data}`} alt="" width={poster.width} height={poster.height} />
          <Spinner color="white" />
        </div>
      );
    }

    return <Spinner color="white" />;
  }

  if (!selectedMediaMessageId && previousBlobUrl) {
    return <VideoPlayer key={previousBlobUrl} url={previousBlobUrl} />;
  }

  return null;
}

function renderPhoto({
  selectedMediaMessageId, blobUrl, previousBlobUrl,
}: IPhotoRenderProps) {
  if (selectedMediaMessageId && blobUrl) {
    return <img src={blobUrl} alt="" />;
  }

  if (selectedMediaMessageId && !blobUrl) {
    return <Spinner color="white" />;
  }

  if (!selectedMediaMessageId && previousBlobUrl) {
    return <img src={previousBlobUrl} alt="" />;
  }

  return null;
}

export default memo(withGlobal(
  (global) => {
    const { chats: { selectedId: chatId }, messages: { selectedMediaMessageId } } = global;
    if (!chatId || !selectedMediaMessageId) {
      return {};
    }

    const chatMessages = selectChatMessages(global, chatId);
    const message = selectChatMessage(global, chatId, selectedMediaMessageId);
    const mediaHash = message && getMessageMediaHash(message);

    let messageText;
    let isPhoto = false;
    let isVideo = false;
    let poster;
    if (message) {
      const { text, photo, video } = buildMessageContent(message);
      messageText = text;
      isPhoto = Boolean(photo);
      isVideo = Boolean(video);
      if (video) {
        poster = video.minithumbnail;
      }
    }

    return {
      chatId: message && message.chat_id,
      selectedMediaMessageId,
      isPhoto,
      isVideo,
      mediaHash,
      messageText,
      chatMessages,
      poster,
    };
  },
  (setGlobal, actions) => {
    const { selectMediaMessage } = actions;
    return { selectMediaMessage };
  },
)(MediaViewer));
