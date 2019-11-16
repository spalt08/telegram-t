import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import {
  ApiUser,
  ApiMessage,
  ApiPhoto,
  ApiSticker,
} from '../../../../api/tdlib/types';
import {
  getMessageText,
  getMessagePhoto,
  isOwnMessage,
  getUserFullName,
  getPhotoUrl,
  getMessageSticker,
} from '../../../../modules/tdlib/helpers';
import { selectUser } from '../../../../modules/tdlib/selectors';
import parseEmojiOnlyString from '../../../../util/parseEmojiOnlyString';
import Avatar from '../../../../components/Avatar';
import Spinner from '../../../../components/Spinner';
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
  const {
    text,
    photo,
    sticker,
    className: contentClassName,
  } = buildContent(message);
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
        {renderMessagePhoto(photo)}
        {renderMessageSticker(sticker)}
        {text && (
          <p>{text}</p>
        )}
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

interface MessageContent {
  text?: TextPart | TextPart[];
  photo?: ApiPhoto;
  sticker?: ApiSticker;
  className?: string;
}

function buildContent(message: ApiMessage): MessageContent {
  const text = getMessageText(message);
  const photo = getMessagePhoto(message);
  const sticker = getMessageSticker(message);
  const classNames = ['content'];
  let contentParts: TextPart | TextPart[] | undefined;

  if (text) {
    const emojiOnlyCount = parseEmojiOnlyString(text);

    if (!photo && emojiOnlyCount && emojiOnlyCount <= MAX_EMOJI_COUNT) {
      classNames.push(`sticker emoji-only-${emojiOnlyCount}`);
      contentParts = text;
    } else {
      classNames.push('text');
      contentParts = enhanceTextParts(text, [addLineBreaks, addBreaksToLongWords, addLinks]);
    }
  }

  if (photo) {
    classNames.push('photo');
  }

  if (sticker) {
    classNames.push('sticker');
  }

  classNames.push('status-read');

  return {
    text: contentParts,
    photo,
    sticker,
    className: classNames.join(' '),
  };
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

function renderMessagePhoto(photo?: ApiPhoto) {
  if (!photo) {
    return null;
  }

  const photoUrl = getPhotoUrl(photo);
  if (photoUrl) {
    return (
      <div className="photo-content">
        <img src={photoUrl} alt="" />
      </div>
    );
  }

  const thumbnail = photo.minithumbnail;
  if (!thumbnail) {
    return null;
  }

  return (
    <div className="photo-content message-photo-thumbnail">
      <img src={`data:image/jpeg;base64, ${thumbnail.data}`} alt="" />
      <div className="message-photo-loading">
        <Spinner color="white" />
      </div>
    </div>
  );
}

function renderMessageSticker(sticker?: ApiSticker) {
  if (!sticker) {
    return null;
  }

  // TODO @mockup
  return (
    <p>{sticker.emoji}</p>
  );
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
