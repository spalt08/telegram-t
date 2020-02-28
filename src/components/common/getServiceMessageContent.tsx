import React from '../../lib/teact/teact';

import { ApiMessage, ApiUser } from '../../api/types';
import { getUserFullName } from '../../modules/helpers';
import { buildMessageContent } from '../middle/message/util/buildMessageContent';
import { TextPart } from '../middle/message/util/enhanceText';

import UserLink from './UserLink';
import MessageLink from './MessageLink';

interface ServiceMessageTextOptions {
  maxTextLength?: number;
  plain?: boolean;
  isReply?: boolean;
}

const DEFAULT_MAX_TEXT_LENGTH = 30;
const NBSP = '\u00A0';

function processPlaceholder(text: string, placeholder: string, replaceValue?: TextPart): TextPart[] {
  const placeholderPosition = text.indexOf(placeholder);
  if (placeholderPosition < 0 || !replaceValue) {
    return [text];
  }

  const content: TextPart[] = [];
  content.push(text.substring(0, placeholderPosition));
  content.push(replaceValue);
  content.push(text.substring(placeholderPosition + placeholder.length));

  return content;
}

function getMessageContent(message: ApiMessage, options: ServiceMessageTextOptions = {}) {
  const {
    text,
    photo,
    video,
    document,
    sticker,
  } = buildMessageContent(message, { isPlain: true });

  const maxTextLength = options.maxTextLength || DEFAULT_MAX_TEXT_LENGTH;

  const showQuotes = text && !photo && !video && !document && !sticker;
  let messageText = text as string;
  if (messageText.length > maxTextLength) {
    messageText = `${messageText.substr(0, maxTextLength)}...`;
  }
  if (photo) {
    messageText = 'a photo';
  } else if (video) {
    messageText = video.isGif ? 'a GIF' : 'a video';
  } else if (document) {
    messageText = 'a document';
  } else if (sticker) {
    messageText = `a ${text} sticker`;
  }

  if (options.plain) {
    return showQuotes ? `«${messageText}»` : messageText;
  }

  if (showQuotes) {
    return (
      <span>
        &laquo;
        <MessageLink className="action-link" message={message}>{messageText}</MessageLink>
        &raquo;
      </span>
    );
  }

  return (
    <MessageLink className="action-link" message={message}>{messageText}</MessageLink>
  );
}

function getUserContent(sender: ApiUser, plain?: boolean): string | TextPart | undefined {
  if (plain) {
    return getUserFullName(sender);
  }
  return <UserLink className="action-link" sender={sender}>{getUserFullName(sender)}</UserLink>;
}

export function getServiceMessageContent(
  message: ApiMessage,
  originUser?: ApiUser,
  targetUser?: ApiUser,
  targetMessage?: ApiMessage,
  options: ServiceMessageTextOptions = {},
) {
  if (!message.content.action) {
    return [];
  }
  const { text } = message.content.action;
  const content: TextPart[] = [];
  const textOptions: ServiceMessageTextOptions = { ...options, maxTextLength: 16 };

  const processedOriginUserText = processPlaceholder(
    text,
    '%origin_user%',
    originUser
      ? (!options.isReply && getUserContent(originUser, options.plain)) || NBSP
      : 'User',
  );

  const secondPart = processedOriginUserText.pop() as string;
  content.push(...processedOriginUserText);

  const processedTargetUserText = processPlaceholder(
    secondPart,
    '%target_user%',
    targetUser
      ? getUserContent(targetUser, options.plain)
      : 'User',
  );

  const thirdPart = processedTargetUserText.pop() as string;
  content.push(...processedTargetUserText);

  const processedMessageText = processPlaceholder(
    thirdPart,
    '%message%',
    targetMessage
      ? getMessageContent(targetMessage, textOptions)
      : 'a message',
  );

  content.push(...processedMessageText);

  if (options.plain) {
    return content.join('').trim();
  }

  return content;
}
