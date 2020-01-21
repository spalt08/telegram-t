/* eslint-disable jsx-a11y/anchor-is-valid */
import React from '../../../../lib/teact/teact';
import { ApiFormattedText, ApiMessageEntity } from '../../../../api/types';
import { DEBUG } from '../../../../config';
import MentionLink from '../MentionLink';
import SafeLink from '../SafeLink';

export type TextPart = string | Element;

function stopPropagation(event: any) {
  event.stopPropagation();
}

function getBotCommand(entityText: string) {
  return entityText.length > 0 && entityText[0] === '/' ? entityText.substring(1) : entityText;
}

function getLinkUrl(entityText: string, entity: ApiMessageEntity) {
  const { className, url } = entity;
  return className === 'MessageEntityTextUrl' && url ? url : entityText;
}

function searchCurrentChat(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, text: string) {
  event.stopPropagation();
  event.preventDefault();

  // TODO @not-implemented
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log('Search chat:', text);
  }
}

export function enhanceTextParts(formattedText?: ApiFormattedText) {
  if (
    !formattedText
    || formattedText['@type'] !== 'formattedText'
  ) {
    return undefined;
  }
  const { text, entities } = formattedText;
  if (!text) {
    return undefined;
  }
  if (!entities) {
    return addLineBreaks(text);
  }

  let deleteLineBreakAfterPre = false;
  const result: TextPart[] = [];
  let index = 0;

  entities.forEach((entity) => {
    const { offset, length, className } = entity;
    let textBefore = text.substring(index, offset);
    const textBeforeLength = textBefore.length;
    if (textBefore) {
      if (deleteLineBreakAfterPre && textBefore.length > 0 && textBefore[0] === '\n') {
        textBefore = textBefore.substr(1);
        deleteLineBreakAfterPre = false;
      }
      if (textBefore) {
        result.push(...addLineBreaks(textBefore));
      }
    }

    const entityKey = offset;
    let entityText = text.substring(offset, offset + length);
    if (deleteLineBreakAfterPre && entityText.length > 0 && entityText[0] === '\n') {
      entityText = entityText.substr(1);
      deleteLineBreakAfterPre = false;
    }

    switch (className) {
      case 'MessageEntityBold':
        result.push(<strong key={entityKey}>{addLineBreaks(entityText)}</strong>);
        break;
      case 'MessageEntityBlockquote':
        result.push(<blockquote key={entityKey}>{addLineBreaks(entityText)}</blockquote>);
        break;
      // TODO @not-implemented
      case 'MessageEntityBotCommand':
        result.push(
          <a
            key={entityKey}
            onClick={stopPropagation}
            href={`tg://bot_command?command=${getBotCommand(entityText)}&bot=`}
            className="not-implemented"
          >
            {entityText}
          </a>,
        );
        break;
      case 'MessageEntityCashtag':
        result.push(
          <a
            key={entityKey}
            onClick={(event) => searchCurrentChat(event, entityText)}
          >
            {entityText}
          </a>,
        );
        break;
      case 'MessageEntityCode':
        result.push(<code key={entityKey}>{addLineBreaks(entityText)}</code>);
        break;
      case 'MessageEntityEmail':
        result.push(
          <a
            key={entityKey}
            href={`mailto:${entityText}`}
            onClick={stopPropagation}
            target="_blank"
            rel="noopener noreferrer"
          >
            {entityText}
          </a>,
        );
        break;
      case 'MessageEntityHashtag':
        result.push(
          <a key={entityKey} onClick={(event) => searchCurrentChat(event, entityText)}>
            {entityText}
          </a>,
        );
        break;
      case 'MessageEntityItalic':
        result.push(<em key={entityKey}>{addLineBreaks(entityText)}</em>);
        break;
      case 'MessageEntityMentionName':
        result.push(
          <MentionLink key={entityKey} userId={entity.user_id} text={entityText} />,
        );
        break;
      case 'MessageEntityMention':
        result.push(
          <MentionLink key={entityKey} userName={entityText} text={entityText} />,
        );
        break;
      case 'MessageEntityPhone':
        result.push(
          <a key={entityKey} href={`tel:${entityText}`} onClick={stopPropagation}>
            {entityText}
          </a>,
        );
        break;
      case 'MessageEntityPre':
        result.push(<pre key={entityKey}>{addLineBreaks(entityText)}</pre>);
        deleteLineBreakAfterPre = true;
        break;
      case 'MessageEntityStrike':
        result.push(<del key={entityKey}>{addLineBreaks(entityText)}</del>);
        break;
      case 'MessageEntityTextUrl':
      case 'MessageEntityUrl':
        result.push(<SafeLink key={entityKey} url={getLinkUrl(entityText, entity)} text={entityText} />);
        break;
      case 'MessageEntityUnderline':
        result.push(<ins key={entityKey}>{addLineBreaks(entityText)}</ins>);
        break;
      default:
        result.push(...addLineBreaks(entityText));
        break;
    }

    index += textBeforeLength + entity.length;
  });

  if (index < text.length) {
    let textAfter = text.substring(index);
    if (deleteLineBreakAfterPre && textAfter.length > 0 && textAfter[0] === '\n') {
      textAfter = textAfter.substring(1);
    }
    if (textAfter) {
      result.push(...addLineBreaks(textAfter));
    }
  }

  return result;
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
