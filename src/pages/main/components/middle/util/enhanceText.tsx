import React from '../../../../../lib/teact';

export type TextPart = string | Element;

export function enhanceTextParts(text: string, enhancers: ((part: TextPart) => TextPart[])[]) {
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

export function addLineBreaks(part: TextPart): TextPart[] {
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

export function addLinks(part: TextPart): TextPart[] {
  return replaceWordsWithElements(
    part,
    (word) => word.startsWith('http:') || word.startsWith('https:'),
    (word) => (
      <a href={word} target="_blank" rel="noopener noreferrer">{word}</a>
    ),
  );
}

export function addBreaksToLongWords(part: TextPart): TextPart[] {
  return replaceWordsWithElements(
    part,
    (word) => word.length > 50,
    (word) => (
      <div className="long-word-break-all">{word}</div>
    ),
  );
}

export function replaceWordsWithElements(
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
