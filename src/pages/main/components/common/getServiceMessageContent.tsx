import React from '../../../../lib/teact';
import { ApiMessage, ApiUser } from '../../../../api/types';
import { getUserFullName } from '../../../../modules/helpers';
import { buildMessageContent } from '../middle/message/utils';

type TextPart = string | Element;
interface ServiceMessageTextOptions {
  maxTextLength?: number;
  plain?: boolean;
}

const DEFAULT_MAX_TEXT_LENGTH = 30;

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
  sender?: ApiUser,
  targetMessage?: ApiMessage,
  options: ServiceMessageTextOptions = {},
) {
  if (!message.content.action) {
    return [];
  }
  const { text } = message.content.action;
  const content: TextPart[] = [];

  const processedUserText = processPlaceholder(
    text,
    '%user%',
    sender
      ? getPinnedMessageUsername(sender, options.plain)
      : 'User',
  );

  const rest = processedUserText.pop() as string;
  content.push(...processedUserText);

  const processedMessageText = processPlaceholder(
    rest,
    '%message%',
    targetMessage
      ? getPinnedMessageText(targetMessage, options)
      : 'a message',
  );

  content.push(...processedMessageText);
  return content;
}
