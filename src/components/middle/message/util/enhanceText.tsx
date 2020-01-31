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

function processEntity(
  className: string,
  entity: ApiMessageEntity,
  entityKey: number,
  entityText: string,
) {
  switch (className) {
    case 'MessageEntityBold':
      return <strong key={entityKey}>{addLineBreaks(entityText)}</strong>;
    case 'MessageEntityBlockquote':
      return <blockquote key={entityKey}>{addLineBreaks(entityText)}</blockquote>;
    // TODO @not-implemented
    case 'MessageEntityBotCommand':
      return (
        <a
          key={entityKey}
          onClick={stopPropagation}
          href={`tg://bot_command?command=${getBotCommand(entityText)}&bot=`}
          className="text-entity-link not-implemented"
        >
          {addLineBreaks(entityText)}
        </a>
      );
    case 'MessageEntityCashtag':
      return (
        <a
          key={entityKey}
          onClick={(event) => searchCurrentChat(event, entityText)}
          className="text-entity-link"
        >
          {addLineBreaks(entityText)}
        </a>
      );
    case 'MessageEntityCode':
      return <code className="text-entity-code" key={entityKey}>{addLineBreaks(entityText)}</code>;
    case 'MessageEntityEmail':
      // TODO check children
      return (
        <a
          key={entityKey}
          href={`mailto:${entityText}`}
          onClick={stopPropagation}
          target="_blank"
          rel="noopener noreferrer"
          className="text-entity-link"
        >
          {addLineBreaks(entityText)}
        </a>
      );
    case 'MessageEntityHashtag':
      // TODO check children
      return (
        <a
          key={entityKey}
          onClick={(event) => searchCurrentChat(event, entityText)}
          className="text-entity-link"
        >
          {addLineBreaks(entityText)}
        </a>
      );
    case 'MessageEntityItalic':
      return <em key={entityKey}>{addLineBreaks(entityText)}</em>;
    case 'MessageEntityMentionName':
      return (
        <MentionLink key={entityKey} userId={entity.user_id}>
          {addLineBreaks(entityText)}
        </MentionLink>
      );
    case 'MessageEntityMention':
      return (
        <MentionLink key={entityKey} userName={entityText}>
          {addLineBreaks(entityText)}
        </MentionLink>
      );
    case 'MessageEntityPhone':
      return (
        // TODO check children
        <a
          key={entityKey}
          href={`tel:${entityText}`}
          onClick={stopPropagation}
          className="text-entity-link"
        >
          {addLineBreaks(entityText)}
        </a>
      );
    case 'MessageEntityPre':
      return <pre className="text-entity-pre" key={entityKey}>{addLineBreaks(entityText)}</pre>;
    case 'MessageEntityStrike':
      return <del key={entityKey}>{addLineBreaks(entityText)}</del>;
    case 'MessageEntityTextUrl':
    case 'MessageEntityUrl':
      return (
        <SafeLink
          key={entityKey}
          url={getLinkUrl(entityText, entity)}
          text={entityText}
        >
          {addLineBreaks(entityText)}
        </SafeLink>
      );
    case 'MessageEntityUnderline':
      return <ins key={entityKey}>{addLineBreaks(entityText)}</ins>;
    default:
      return addLineBreaks(entityText);
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

  entities.forEach((entity, arrayIndex) => {
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

    if (className === 'MessageEntityPre') {
      deleteLineBreakAfterPre = true;
    }

    // TODO Support multiple text entities on same text fragments
    // Currently, if text fragment has multiple text entities, only the last one gets applied
    const nextEntity = entities[arrayIndex + 1];
    if (nextEntity && nextEntity.offset === offset) {
      return;
    }

    const newEntity = processEntity(className, entity, entityKey, entityText);
    if (Array.isArray(newEntity)) {
      result.push(...newEntity);
    } else {
      result.push(newEntity);
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
      // This adds non-breaking space if line was indented with spaces, to preserve the indentation
      const trimmedLine = line.trimLeft();
      const indentLength = line.length - trimmedLine.length;
      parts.push(String.fromCharCode(160).repeat(indentLength) + trimmedLine);

      if (i !== source.length - 1) {
        parts.push(<br />);
      }

      return parts;
    }, []);
}
