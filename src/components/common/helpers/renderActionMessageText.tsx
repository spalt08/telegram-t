import React from '../../../lib/teact/teact';

import { ApiMessage, ApiUser } from '../../../api/types';
import { getMessageContent, getMessageSummaryText, getUserFullName } from '../../../modules/helpers';
import { TextPart } from './renderMessageText';
import renderText from './renderText';

import UserLink from '../UserLink';
import MessageLink from '../MessageLink';

interface ActionMessageTextOptions {
  maxTextLength?: number;
  plain?: boolean;
  isEmbedded?: boolean;
}

const DEFAULT_MAX_TEXT_LENGTH = 30;
const NBSP = '\u00A0';

export function renderActionMessageText(
  message: ApiMessage,
  originUser?: ApiUser,
  targetUser?: ApiUser,
  targetMessage?: ApiMessage,
  options: ActionMessageTextOptions = {},
) {
  if (!message.content.action) {
    return [];
  }
  const { text } = message.content.action;
  const content: TextPart[] = [];
  const textOptions: ActionMessageTextOptions = { ...options, maxTextLength: 16 };

  const processedOriginUserText = processPlaceholder(
    text,
    '%origin_user%',
    originUser
      ? (!options.isEmbedded && renderUserContent(originUser, options.plain)) || NBSP
      : 'User',
  );

  const secondPart = processedOriginUserText.pop() as string;
  content.push(...processedOriginUserText);

  const processedTargetUserText = processPlaceholder(
    secondPart,
    '%target_user%',
    targetUser
      ? renderUserContent(targetUser, options.plain)
      : 'User',
  );

  const thirdPart = processedTargetUserText.pop() as string;
  content.push(...processedTargetUserText);

  const processedMessageText = processPlaceholder(
    thirdPart,
    '%message%',
    targetMessage
      ? renderMessageContent(targetMessage, textOptions)
      : 'a message',
  );

  content.push(...processedMessageText);

  if (options.plain) {
    return content.join('').trim();
  }

  return content;
}

function renderMessageContent(message: ApiMessage, options: ActionMessageTextOptions = {}) {
  const text = getMessageSummaryText(message);
  const {
    photo, video, document, sticker,
  } = getMessageContent(message);

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
        <MessageLink className="action-link" message={message}>{renderText(messageText)}</MessageLink>
        &raquo;
      </span>
    );
  }

  return (
    <MessageLink className="action-link" message={message}>{renderText(messageText)}</MessageLink>
  );
}

function renderUserContent(sender: ApiUser, plain?: boolean): string | TextPart | undefined {
  if (plain) {
    return getUserFullName(sender);
  }

  return <UserLink className="action-link" sender={sender}>{sender && renderText(getUserFullName(sender)!)}</UserLink>;
}

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
