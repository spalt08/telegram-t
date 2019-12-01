import { isSameDay } from '../../../../../util/dateFormat';
import parseEmojiOnlyString from '../../../../../util/parseEmojiOnlyString';
import {
  getMessageText,
  getMessagePhoto,
  getMessageSticker,
} from '../../../../../modules/helpers';
import {
  ApiMessage,
  ApiPhoto,
  ApiSticker,
} from '../../../../../api/types';

import {
  TextPart,
  enhanceTextParts,
  addLineBreaks,
  addBreaksToLongWords,
  addLinks,
} from './enhanceText';

export type MessageDateGroup = {
  datetime: number;
  messageGroups: ApiMessage[][];
};

export interface MessageContent {
  text?: TextPart | TextPart[];
  photo?: ApiPhoto;
  sticker?: ApiSticker;
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
  noEnhancedText?: boolean;
}

export function buildMessageContent(message: ApiMessage, options: BuildMessageContentOptions = {}): MessageContent {
  const text = getMessageText(message);
  const photo = getMessagePhoto(message);
  const sticker = getMessageSticker(message);
  const classNames = ['content'];
  let contentParts: TextPart | TextPart[] | undefined;

  if (text) {
    const emojiOnlyCount = parseEmojiOnlyString(text);

    if (!photo && emojiOnlyCount && emojiOnlyCount <= MAX_EMOJI_COUNT) {
      classNames.push('sticker');
      classNames.push(`emoji-only-${emojiOnlyCount}`);
      contentParts = text;
    } else {
      classNames.push('text');
      contentParts = enhanceTextParts(
        text,
        options.noEnhancedText ? [] : [addLineBreaks, addBreaksToLongWords, addLinks],
      );
    }
  }

  if (photo) {
    classNames.push('photo');
  }

  if (sticker) {
    classNames.push('sticker');
  }

  if (message.forward_info && !classNames.includes('sticker')) {
    classNames.push('is-forwarded');
  }

  classNames.push('status-read');

  return {
    text: contentParts,
    photo,
    sticker,
    className: classNames.join(' '),
  };
}
