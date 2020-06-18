/* eslint-disable jsx-a11y/anchor-is-valid */
import React from '../../../lib/teact/teact';
import { ApiMessageEntity, ApiMessageEntityTypes, ApiMessage } from '../../../api/types';

import { DEBUG } from '../../../config';
import { getMessageText } from '../../../modules/helpers';
import renderText from './renderText';

import MentionLink from '../../middle/message/MentionLink';
import SafeLink from '../../middle/message/SafeLink';

export type TextPart = string | Element;

export function renderMessageText(message: ApiMessage, highlight?: string) {
  const formattedText = message.content.text;

  if (!formattedText || !formattedText.text) {
    const rawText = getMessageText(message);
    return rawText ? [rawText] : undefined;
  }
  const { text, entities } = formattedText;

  return renderTextWithEntities(text, entities, highlight);
}

export function renderTextWithEntities(text?: string, entities?: ApiMessageEntity[], highlight?: string) {
  if (!text) {
    return undefined;
  }
  if (!entities) {
    return renderMessagePart(text, highlight);
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
        result.push(...renderMessagePart(textBefore, highlight) as TextPart[]);
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
      result.push(...renderMessagePart(textAfter, highlight) as TextPart[]);
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
    return renderMessagePart(entityContent);
  }

  switch (entity.type) {
    case ApiMessageEntityTypes.Bold:
      return <strong>{renderMessagePart(entityContent)}</strong>;
    case ApiMessageEntityTypes.Blockquote:
      return <blockquote>{renderMessagePart(entityContent)}</blockquote>;
    // TODO @not-implemented
    case ApiMessageEntityTypes.BotCommand:
      return (
        <a
          onClick={stopPropagation}
          href={`tg://bot_command?command=${getBotCommand(entityText)}&bot=`}
          className="text-entity-link not-implemented"
        >
          {renderMessagePart(entityContent)}
        </a>
      );
    case ApiMessageEntityTypes.Cashtag:
      return (
        <a
          onClick={(event) => searchCurrentChat(event, entityText)}
          className="text-entity-link not-implemented"
        >
          {renderMessagePart(entityContent)}
        </a>
      );
    case ApiMessageEntityTypes.Code:
      return <code className="text-entity-code">{renderMessagePart(entityContent)}</code>;
    case ApiMessageEntityTypes.Email:
      return (
        <a
          href={`mailto:${entityText}`}
          onClick={stopPropagation}
          target="_blank"
          rel="noopener noreferrer"
          className="text-entity-link"
        >
          {renderMessagePart(entityContent)}
        </a>
      );
    case ApiMessageEntityTypes.Hashtag:
      return (
        <a
          onClick={(event) => searchCurrentChat(event, entityText)}
          className="text-entity-link not-implemented"
        >
          {renderMessagePart(entityContent)}
        </a>
      );
    case ApiMessageEntityTypes.Italic:
      return <em>{renderMessagePart(entityContent)}</em>;
    case ApiMessageEntityTypes.MentionName:
      return (
        <MentionLink userId={entity.userId}>
          {renderMessagePart(entityContent)}
        </MentionLink>
      );
    case ApiMessageEntityTypes.Mention:
      return (
        <MentionLink username={entityText}>
          {renderMessagePart(entityContent)}
        </MentionLink>
      );
    case ApiMessageEntityTypes.Phone:
      return (
        <a
          href={`tel:${entityText}`}
          onClick={stopPropagation}
          className="text-entity-link"
        >
          {renderMessagePart(entityContent)}
        </a>
      );
    case ApiMessageEntityTypes.Pre:
      return <pre className="text-entity-pre">{renderMessagePart(entityContent)}</pre>;
    case ApiMessageEntityTypes.Strike:
      return <del>{renderMessagePart(entityContent)}</del>;
    case ApiMessageEntityTypes.TextUrl:
    case ApiMessageEntityTypes.Url:
      return (
        <SafeLink
          url={getLinkUrl(entityText, entity)}
          text={entityText}
        >
          {renderMessagePart(entityContent)}
        </SafeLink>
      );
    case ApiMessageEntityTypes.Underline:
      return <ins>{renderMessagePart(entityContent)}</ins>;
    default:
      return renderMessagePart(entityContent);
  }
}

function renderMessagePart(str: TextPart, highlight?: string) {
  if (highlight) {
    return renderText(str, ['hq_emoji', 'br', 'highlight'], { highlight });
  } else {
    return renderText(str, ['hq_emoji', 'br']);
  }
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
