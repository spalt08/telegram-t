import React, { FC } from '../../../../lib/teact';
import { DispatchMap, withGlobal } from '../../../../lib/teactn';
import { ApiMessage } from '../../../../modules/tdlib/types/messages';

import { getMessageText, isOwnMessage } from '../../../../modules/tdlib/helpers';
import parseEmojiOnlyString from '../../../../util/parseEmojiOnlyString';
import Avatar from '../../../../components/Avatar';
import './Message.scss';

type IProps = {
  message: ApiMessage,
  isSelected: boolean,
} & Pick<DispatchMap, 'selectMessage'>;

type TextPart = string | Element;

const Message: FC<IProps> = ({ message, isSelected }) => {
  const text = getMessageText(message);
  let className;
  let textParts: TextPart | TextPart[] | undefined;

  if (text) {
    const emojiOnlyCount = parseEmojiOnlyString(text);

    if (emojiOnlyCount) {
      className = emojiOnlyCount ? `emoji-only-${emojiOnlyCount}` : undefined;
      textParts = text;
    } else {
      className = 'text';
      textParts = enhanceTextParts(text, [addBreaksToLongWords, addLineBreaks]);
    }
  }

  return (
    <div className={`Message ${isSelected ? 'selected' : ''} ${isOwnMessage(message) ? 'own' : ''}`}>
      <Avatar size="small">HE</Avatar>
      <div className={className}>{textParts}</div>
    </div>
  );
};

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
    .split(/\n/g)
    .reduce((parts: TextPart[], line: string) => {
      parts.push(line);
      parts.push(<br />);

      return parts;
    }, []);
}

function addBreaksToLongWords(part: TextPart): TextPart[] {
  let wasLastLong = false;

  if (typeof part !== 'string') {
    return [part];
  }

  return part
    .split(' ')
    .reduce((parts: TextPart[], word: string, i) => {
      if (word.length > 50) {
        parts.push(<div className="long-word-break-all">{word}</div>);
        wasLastLong = true;
      } else {
        if (parts.length > 0 && !wasLastLong) {
          parts[parts.length - 1] += ` ${word}`;
        } else {
          parts.push(word);
        }

        wasLastLong = false;
      }

      return parts;
    }, []);
}

export default withGlobal(
  (global, ownProps) => {
    const { messages } = global;
    const { id } = ownProps;

    return {
      isSelected: Number(id) === messages.selectedId,
    };
  },
  (setGlobal, actions) => {
    const { selectMessage } = actions;
    return { selectMessage };
  },
)(Message);
