/* eslint-disable jsx-a11y/anchor-is-valid */
import React from '../lib/teact/teact';
import { ApiFormattedText, ApiMessageEntity, ApiMessageEntityTypes } from '../api/types';
import { DEBUG } from '../config';
import MentionLink from '../components/middle/message/MentionLink';
import SafeLink from '../components/middle/message/SafeLink';

export type TextPart = string | Element;

export function renderMessageText(formattedText?: ApiFormattedText) {
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
  let nestedEntity: TextPart | undefined;
  let nestedEntityText: string | undefined;

  entities.forEach((entity, arrayIndex) => {
    const { offset, length, type } = entity;
    let textBefore = text.substring(index, offset);
    const textBeforeLength = textBefore.length;
    if (textBefore) {
      if (deleteLineBreakAfterPre && textBefore.length > 0 && textBefore[0] === '\n') {
        textBefore = textBefore.substr(1);
        deleteLineBreakAfterPre = false;
      }
      if (!nestedEntity && textBefore) {
        result.push(...addLineBreaks(textBefore));
      }
    }

    let entityContent: TextPart = text.substring(offset, offset + length);
    if (nestedEntity) {
      entityContent = nestedEntity;
    } else if (deleteLineBreakAfterPre && entityContent.length > 0 && entityContent[0] === '\n') {
      entityContent = entityContent.substr(1);
      deleteLineBreakAfterPre = false;
    }

    if (type === ApiMessageEntityTypes.Pre) {
      deleteLineBreakAfterPre = true;
    }

    const newEntity = processEntity(entity, entityContent, nestedEntityText);

    const nextEntity = entities[arrayIndex + 1];
    if (nextEntity && nextEntity.offset >= offset && nextEntity.offset < offset + length) {
      // If there are multiple entities on the same offset, store current processed entity
      // to insert it inside another processed entity on next iteration
      nestedEntity = newEntity;
      if (nextEntity.offset !== offset) {
        nestedEntityText = text.substring(nextEntity.offset, nextEntity.offset + nextEntity.length);
      } else if (typeof entityContent === 'string') {
        nestedEntityText = entityContent;
      }
      return;
    } else {
      nestedEntity = undefined;
      nestedEntityText = undefined;
    }

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

function processEntity(
  entity: ApiMessageEntity,
  entityContent: TextPart,
  nestedEntityText?: string,
) {
  const entityText = typeof entityContent === 'string'
    ? entityContent
    : nestedEntityText;

  if (!entityText) {
    return addLineBreaks(entityContent);
  }

  switch (entity.type) {
    case ApiMessageEntityTypes.Bold:
      return <strong>{addLineBreaks(entityContent)}</strong>;
    case ApiMessageEntityTypes.Blockquote:
      return <blockquote>{addLineBreaks(entityContent)}</blockquote>;
    // TODO @not-implemented
    case ApiMessageEntityTypes.BotCommand:
      return (
        <a
          onClick={stopPropagation}
          href={`tg://bot_command?command=${getBotCommand(entityText)}&bot=`}
          className="text-entity-link not-implemented"
        >
          {addLineBreaks(entityContent)}
        </a>
      );
    case ApiMessageEntityTypes.Cashtag:
      return (
        <a
          onClick={(event) => searchCurrentChat(event, entityText)}
          className="text-entity-link"
        >
          {addLineBreaks(entityContent)}
        </a>
      );
    case ApiMessageEntityTypes.Code:
      return <code className="text-entity-code">{addLineBreaks(entityContent)}</code>;
    case ApiMessageEntityTypes.Email:
      return (
        <a
          href={`mailto:${entityText}`}
          onClick={stopPropagation}
          target="_blank"
          rel="noopener noreferrer"
          className="text-entity-link"
        >
          {addLineBreaks(entityContent)}
        </a>
      );
    case ApiMessageEntityTypes.Hashtag:
      return (
        <a
          onClick={(event) => searchCurrentChat(event, entityText)}
          className="text-entity-link"
        >
          {addLineBreaks(entityContent)}
        </a>
      );
    case ApiMessageEntityTypes.Italic:
      return <em>{addLineBreaks(entityContent)}</em>;
    case ApiMessageEntityTypes.MentionName:
      return (
        <MentionLink userId={entity.userId}>
          {addLineBreaks(entityContent)}
        </MentionLink>
      );
    case ApiMessageEntityTypes.Mention:
      return (
        <MentionLink userName={entityText}>
          {addLineBreaks(entityContent)}
        </MentionLink>
      );
    case ApiMessageEntityTypes.Phone:
      return (
        <a
          href={`tel:${entityText}`}
          onClick={stopPropagation}
          className="text-entity-link"
        >
          {addLineBreaks(entityContent)}
        </a>
      );
    case ApiMessageEntityTypes.Pre:
      return <pre className="text-entity-pre">{addLineBreaks(entityContent)}</pre>;
    case ApiMessageEntityTypes.Strike:
      return <del>{addLineBreaks(entityContent)}</del>;
    case ApiMessageEntityTypes.TextUrl:
    case ApiMessageEntityTypes.Url:
      return (
        <SafeLink
          url={getLinkUrl(entityText, entity)}
          text={entityText}
        >
          {addLineBreaks(entityContent)}
        </SafeLink>
      );
    case ApiMessageEntityTypes.Underline:
      return <ins>{addLineBreaks(entityContent)}</ins>;
    default:
      return addLineBreaks(entityContent);
  }
}

function addLineBreaks(part: TextPart): TextPart[] {
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

function stopPropagation(event: any) {
  event.stopPropagation();
}

function getBotCommand(entityContent: string) {
  return entityContent.length > 0 && entityContent[0] === '/' ? entityContent.substring(1) : entityContent;
}

function getLinkUrl(entityContent: string, entity: ApiMessageEntity) {
  const { type, url } = entity;
  return type === ApiMessageEntityTypes.TextUrl && url ? url : entityContent;
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
