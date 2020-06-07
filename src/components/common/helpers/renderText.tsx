import emojiRegex from 'emoji-regex';
import React from '../../../lib/teact/teact';

import { IS_EMOJI_SUPPORTED } from '../../../util/environment';
import { nativeToUnfified } from '../../../util/emoji';
import buildClassName from '../../../util/buildClassName';

type TextPart = string | Element;

export default function renderText(
  part: TextPart,
  filters: Array<'escape_html' | 'hq_emoji' | 'emoji' | 'emoji_html' | 'br' | 'br_html' | 'highlight'> = ['emoji'],
  params?: { query: string | undefined },
): TextPart[] {
  if (typeof part !== 'string') {
    return [part];
  }

  return filters.reduce((text, filter) => {
    switch (filter) {
      case 'escape_html':
        return escapeHtml(text);

      case 'hq_emoji':
        return replaceEmojis(text);

      case 'emoji':
        return replaceEmojis(text, 'small');

      case 'emoji_html':
        return replaceEmojis(text, 'small', 'html');

      case 'br':
        return addLineBreaks(text);

      case 'br_html':
        return addLineBreaks(text, 'html');

      case 'highlight':
        return addHighlight(text, params!.query);
    }

    return text;
  }, [part] as TextPart[]);
}

function escapeHtml(textParts: TextPart[]): TextPart[] {
  const divEl = document.createElement('div');
  return textParts.reduce((result, part) => {
    if (typeof part !== 'string') {
      return [...result, part];
    }

    divEl.innerText = part;

    return [...result, divEl.innerHTML];
  }, [] as TextPart[]);
}

function replaceEmojis(textParts: TextPart[], size: 'big' | 'small' = 'big', type: 'jsx' | 'html' = 'jsx'): TextPart[] {
  if (IS_EMOJI_SUPPORTED) {
    return textParts;
  }

  const regex = emojiRegex();

  return textParts.reduce((result, part) => {
    if (typeof part !== 'string') {
      return [...result, part];
    }

    const parts = part.split(regex);
    const emojis = part.match(regex) || [];
    result.push(parts[0]);

    return emojis.reduce((emojiResult: TextPart[], emoji, i) => {
      const code = nativeToUnfified(emoji);
      const className = buildClassName(
        'emoji',
        size === 'small' && 'emoji-small',
      );
      if (type === 'jsx') {
        emojiResult.push(
          <img
            className={className}
            src={`./img-apple-${size === 'big' ? '160' : '64'}/${code}.png`}
            alt={emoji}
          />,
        );
      }
      if (type === 'html') {
        emojiResult.push(
          // For preventing extra spaces in html
          // eslint-disable-next-line max-len
          `<img draggable="false" class="${className}" src="./img-apple-${size === 'big' ? '160' : '64'}/${code}.png" alt="${emoji}" />`,
        );
      }
      if (parts[i + 1]) {
        emojiResult.push(parts[i + 1]);
      }

      return emojiResult;
    }, result);
  }, [] as TextPart[]);
}

function addLineBreaks(textParts: TextPart[], type: 'jsx' | 'html' = 'jsx'): TextPart[] {
  return textParts.reduce((result, part) => {
    if (typeof part !== 'string') {
      return [...result, part];
    }

    return [...result, ...part
      .split(/\r\n|\r|\n/g)
      .reduce((parts: TextPart[], line: string, i, source) => {
        // This adds non-breaking space if line was indented with spaces, to preserve the indentation
        const trimmedLine = line.trimLeft();
        const indentLength = line.length - trimmedLine.length;
        parts.push(String.fromCharCode(160).repeat(indentLength) + trimmedLine);

        if (i !== source.length - 1) {
          parts.push(
            type === 'jsx' ? <br /> : '<br />',
          );
        }

        return parts;
      }, [])];
  }, [] as TextPart[]);
}

function addHighlight(textParts: TextPart[], query: string | undefined): TextPart[] {
  return textParts.reduce((result, part) => {
    if (typeof part !== 'string' || !query) {
      return [...result, part];
    }

    const lowerCaseText = part.toLowerCase();
    const queryPosition = lowerCaseText.indexOf(query.toLowerCase());
    if (queryPosition < 0) {
      return [...result, part];
    }

    const content: TextPart[] = [];
    content.push(part.substring(0, queryPosition));
    content.push(
      <span className="matching-text-highlight">{part.substring(queryPosition, queryPosition + query.length)}</span>,
    );
    content.push(part.substring(queryPosition + query.length));

    return content;
  }, [] as TextPart[]);
}
