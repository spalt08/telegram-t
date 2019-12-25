import { isSameDay } from '../../../../../util/dateFormat';
import parseEmojiOnlyString from '../../../../../util/parseEmojiOnlyString';
import {
  getMessageText,
  getMessagePhoto,
  getMessageSticker,
  getMessageVideo,
  getMessageDocument,
  isActionMessage,
  getMessageContact,
} from '../../../../../modules/helpers';
import {
  ApiMessage,
  ApiPhoto,
  ApiSticker,
  ApiVideo,
  ApiDocument,
  ApiMiniThumbnail,
  ApiContact,
} from '../../../../../api/types';

import { TextPart, enhanceTextParts } from './enhanceText';

export type MessageDateGroup = {
  datetime: number;
  messageGroups: ApiMessage[][];
};

export interface MessageContent {
  text?: TextPart | TextPart[];
  photo?: ApiPhoto;
  video?: ApiVideo;
  document?: ApiDocument;
  sticker?: ApiSticker;
  contact?: ApiContact;
  replyThumbnail?: ApiMiniThumbnail;
  className?: string;
}

const MAX_EMOJI_COUNT = 3;

export function groupMessages(messages: ApiMessage[]) {
  const messageDateGroups: MessageDateGroup[] = [
    {
      datetime: messages[0].date * 1000,
      messageGroups: [],
    },
  ];
  let currentMessageGroup: ApiMessage[] = [];
  let currentMessageDateGroup = messageDateGroups[0];

  messages.forEach((message, index) => {
    if (!isSameDay(currentMessageDateGroup.datetime, message.date * 1000)) {
      if (currentMessageDateGroup && currentMessageGroup && currentMessageGroup.length) {
        currentMessageDateGroup.messageGroups.push(currentMessageGroup);
        currentMessageGroup = [];
      }
      messageDateGroups.push({
        datetime: message.date * 1000,
        messageGroups: [],
      });
      currentMessageDateGroup = messageDateGroups[messageDateGroups.length - 1];
    }

    if (
      !currentMessageGroup.length || (
        message.sender_user_id === currentMessageGroup[currentMessageGroup.length - 1].sender_user_id
        // Forwarded messages to chat with self.
        && message.is_outgoing === currentMessageGroup[currentMessageGroup.length - 1].is_outgoing
      )
    ) {
      currentMessageGroup.push(message);
    }

    if (
      messages[index + 1] && (
        message.sender_user_id !== messages[index + 1].sender_user_id
        || message.is_outgoing !== messages[index + 1].is_outgoing
        || isActionMessage(message)
        || isActionMessage(messages[index + 1])
      )
    ) {
      currentMessageDateGroup.messageGroups.push(currentMessageGroup);
      currentMessageGroup = [];
    }
  });

  if (currentMessageGroup.length) {
    currentMessageDateGroup.messageGroups.push(currentMessageGroup);
  }

  return messageDateGroups;
}

interface BuildMessageContentOptions {
  isReply?: boolean;
}

export function buildMessageContent(message: ApiMessage, options: BuildMessageContentOptions = {}): MessageContent {
  const text = getMessageText(message);
  const photo = getMessagePhoto(message);
  const video = getMessageVideo(message);
  const document = getMessageDocument(message);
  const sticker = getMessageSticker(message);
  const contact = getMessageContact(message);
  const classNames = ['content'];
  let contentParts: TextPart | TextPart[] | undefined;
  let replyThumbnail: ApiMiniThumbnail | undefined;

  if (text) {
    const emojiOnlyCount = parseEmojiOnlyString(text);

    if (!photo && emojiOnlyCount && emojiOnlyCount <= MAX_EMOJI_COUNT) {
      classNames.push('sticker');
      classNames.push(`emoji-only-${emojiOnlyCount}`);
      contentParts = text;
    } else {
      classNames.push('text');
      contentParts = options.isReply || !message.content.text ? text : enhanceTextParts(message.content.text);
    }
  }

  if (photo || video) {
    classNames.push('media');
    if (options.isReply) {
      contentParts = photo ? 'Photo' : 'Video';
      replyThumbnail = getReplyThumbnail(photo || video);
    }
  }

  if (sticker) {
    classNames.push('sticker');
  }

  if (document) {
    classNames.push('document');
    if (options.isReply) {
      contentParts = document.fileName;
    }
  }

  if (contact) {
    classNames.push('contact');
  }

  if (message.forward_info && !classNames.includes('sticker')) {
    classNames.push('is-forwarded');
  }

  if (message.reply_to_message_id && !classNames.includes('sticker')) {
    classNames.push('is-reply');
  }

  classNames.push('status-read');

  return {
    text: contentParts,
    photo,
    video,
    document,
    sticker,
    contact,
    replyThumbnail,
    className: classNames.join(' '),
  };
}

function getReplyThumbnail(media?: ApiPhoto | ApiVideo) {
  if (!media) {
    return undefined;
  }
  const { minithumbnail } = media;
  return minithumbnail;
}
