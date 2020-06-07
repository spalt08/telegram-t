import { ApiMessageEntityTypes, ApiMessageEntity, ApiFormattedText } from '../../../../api/types';
import renderText from '../../../common/helpers/renderText';

export default function getMessageTextAsHtml(formattedText?: ApiFormattedText) {
  const { text, entities } = formattedText || {};
  if (!text) {
    return '';
  }
  if (!entities) {
    return renderText(text, ['emoji_html', 'br_html']).join('');
  }

  const result: string[] = [];
  let deleteLineBreakAfterPre = false;
  let index = 0;
  let nestedEntity: string | undefined;
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
        result.push(textBefore);
      }
    }

    let entityContent = text.substring(offset, offset + length);
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
      result.push(textAfter);
    }
  }

  return renderText(result.join(''), ['emoji_html', 'br_html']).join('');
}

function processEntity(
  entity: ApiMessageEntity,
  entityContent: string,
  nestedEntityText?: string,
) {
  const entityText = nestedEntityText || entityContent;

  switch (entity.type) {
    case ApiMessageEntityTypes.Bold:
      return `<b>${entityText}</b>`;
    case ApiMessageEntityTypes.Italic:
      return `<i>${entityText}</i>`;
    case ApiMessageEntityTypes.Underline:
      return `<u>${entityText}</u>`;
    case ApiMessageEntityTypes.Code:
      return `\`${entityText}\``;
    case ApiMessageEntityTypes.Pre:
      return `\`\`\`<br/>${entityText}<br/>\`\`\``;
    case ApiMessageEntityTypes.Strike:
      return `~~${entityText}~~`;
    default:
      return entityText;
  }
}
