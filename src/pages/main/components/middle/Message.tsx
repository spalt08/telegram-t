import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { ApiUser, ApiMessage } from '../../../../api/tdlib/types';
import { getMessageText, isOwnMessage, getUserFullName } from '../../../../modules/tdlib/helpers';
import { selectUser } from '../../../../modules/tdlib/selectors';
import parseEmojiOnlyString from '../../../../util/parseEmojiOnlyString';
import Avatar from '../../../../components/Avatar';
import MessageMeta from './MessageMeta';
import './Message.scss';

type IProps = {
  message: ApiMessage;
  showAvatar?: boolean;
  showSenderName?: boolean;
  sender?: ApiUser;
};

type TextPart = string | Element;

const MAX_EMOJI_COUNT = 3;

const Message: FC<IProps> = ({
  message, showAvatar, showSenderName, sender,
}) => {
  const className = buildClassName(message);
  const [contentParts, contentClassName] = buildContent(message);
  const isText = contentClassName && contentClassName.includes('text');

  return (
    <div className={className}>
      {showAvatar && sender && (
        <Avatar size="small" user={sender} />
      )}
      <div className={contentClassName}>
        {showSenderName && sender && isText && (
          <div className="sender-name">{getUserFullName(sender)}</div>
        )}
        <p>{contentParts}</p>
        <MessageMeta message={message} />
      </div>
    </div>
  );
};

function buildClassName(message: ApiMessage) {
  const classNames = ['Message'];

  if (isOwnMessage(message)) {
    classNames.push('own');
  }

  return classNames.join(' ');
}

function buildContent(message: ApiMessage): [TextPart | TextPart[] | undefined, string | undefined] {
  const text = getMessageText(message);
  const classNames = ['content'];
  let contentParts: TextPart | TextPart[] | undefined;

  if (text) {
    const emojiOnlyCount = parseEmojiOnlyString(text);

    if (emojiOnlyCount && emojiOnlyCount <= MAX_EMOJI_COUNT) {
      classNames.push(`emoji-only-${emojiOnlyCount}`);
      contentParts = text;
    } else {
      classNames.push('text');
      contentParts = enhanceTextParts(text, [addLineBreaks, addBreaksToLongWords, addLinks]);
    }
  }

  classNames.push('status-read');

  return [contentParts, classNames.join(' ')];
}

function enhanceTextParts(text: string, enhancers: ((part: TextPart) => TextPart[])[]) {
  let parts: TextPart[] = [text];

  for (let i = 0, l = enhancers.length; i < l; i++) {
    parts = parts.reduce((enhancedParts: TextPart[], part) => {
      const newParts = enhancers[i](part);

      return [
        ...enhancedParts,
        ...newParts,
      ];
    }, []);
  }

  return parts.length === 1 ? parts[0] : parts;
}

function addLineBreaks(part: TextPart): TextPart[] {
  if (typeof part !== 'string') {
    return [part];
  }

  return part
    .split(/\r\n|\r|\n/g)
    .reduce((parts: TextPart[], line: string, i, source) => {
      parts.push(line);

      if (i !== source.length - 1) {
        parts.push(<br />);
      }

      return parts;
    }, []);
}

function addLinks(part: TextPart): TextPart[] {
  return replaceWordsWithElements(
    part,
    (word) => word.startsWith('http:') || word.startsWith('https:'),
    (word) => (
      <a href={word} target="_blank" rel="noopener noreferrer">{word}</a>
    ),
  );
}

function addBreaksToLongWords(part: TextPart): TextPart[] {
  return replaceWordsWithElements(
    part,
    (word) => word.length > 50,
    (word) => (
      <div className="long-word-break-all">{word}</div>
    ),
  );
}

function replaceWordsWithElements(
  part: TextPart,
  testFn: (word: string) => boolean,
  replaceFn: (word: string) => Element,
): TextPart[] {
  if (typeof part !== 'string') {
    return [part];
  }

  let wasLastTag = false;

  return part
    .split(' ')
    .reduce((parts: TextPart[], word: string) => {
      if (testFn(word)) {
        if (parts.length > 0 && !wasLastTag) {
          parts[parts.length - 1] += ' ';
        }
        parts.push(replaceFn(word));
        wasLastTag = true;
      } else {
        if (parts.length > 0 && !wasLastTag) {
          parts[parts.length - 1] += ` ${word}`;
        } else {
          parts.push(wasLastTag ? ` ${word}` : word);
        }

        wasLastTag = false;
      }

      return parts;
    }, []);
}

export default withGlobal(
  (global, { message, showSenderName, showAvatar }: IProps) => {
    if (!showSenderName && !showAvatar) {
      return null;
    }

    return {
      sender: selectUser(global, message.sender_user_id),
    };
  },
)(Message);
