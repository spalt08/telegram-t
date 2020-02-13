import React from '../../lib/teact/teact';
import { ApiMessage, ApiUser } from '../../api/types';
import { getUserFullName } from '../../modules/helpers';
import { buildMessageContent } from '../middle/message/util/buildMessageContent';

type TextPart = string | Element;
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

export function getPinnedMessageText(message: ApiMessage, options: ServiceMessageTextOptions = {}) {
  const {
    text,
    photo,
    video,
    document,
    sticker,
  } = buildMessageContent(message, { isReply: true });

  const maxTextLength = options.maxTextLength || DEFAULT_MAX_TEXT_LENGTH;

  const showQuotes = text && !photo && !video && !document && !sticker;
  let messageText = text as string;
  if (messageText.length > maxTextLength) {
    messageText = `${messageText.substr(0, maxTextLength)}...`;
  }
  if (photo) {
    messageText = 'a photo';
  } else if (video) {
    messageText = 'a video';
  } else if (document) {
    messageText = 'a document';
  } else if (sticker) {
    messageText = `a ${text} sticker`;
  }

  if (showQuotes) {
    if (options.plain) {
      return `«${messageText}»`;
    }
    return (
      <span>
        &laquo;
        <span className="action-link not-implemented">{messageText}</span>
        &raquo;
      </span>
    );
  }

  if (options.plain) {
    return messageText;
  }

  return (
    <span className="action-link not-implemented">{messageText}</span>
  );
}

export function getPinnedMessageUsername(sender: ApiUser, plain?: boolean) {
  if (plain) {
    return getUserFullName(sender);
  }
  return <span className="action-link not-implemented">{getUserFullName(sender)}</span>;
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

  const processedOriginUserText = processPlaceholder(
    text,
    '%origin_user%',
    originUser
      ? (!options.isReply && getPinnedMessageUsername(originUser, options.plain)) || NBSP
      : 'User',
  );

  const secondPart = processedOriginUserText.pop() as string;
  content.push(...processedOriginUserText);

  const processedTargetUserText = processPlaceholder(
    secondPart,
    '%target_user%',
    targetUser
      ? getPinnedMessageUsername(targetUser, options.plain)
      : 'User',
  );

  const thirdPart = processedTargetUserText.pop() as string;
  content.push(...processedTargetUserText);

  const processedMessageText = processPlaceholder(
    thirdPart,
    '%message%',
    targetMessage
      ? getPinnedMessageText(targetMessage, options)
      : 'a message',
  );

  if (options.plain) {
    return processedMessageText.join('').trim();
  }

  content.push(...processedMessageText);
  return content;
}
