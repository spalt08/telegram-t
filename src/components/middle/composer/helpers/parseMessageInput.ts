import { ApiMessageEntity, ApiMessageEntityTypes } from '../../../../api/types';

const ENTITY_CLASS_BY_NODE_NAME: Record<string, string> = {
  B: ApiMessageEntityTypes.Bold,
  STRONG: ApiMessageEntityTypes.Bold,
  I: ApiMessageEntityTypes.Italic,
  EM: ApiMessageEntityTypes.Italic,
  U: ApiMessageEntityTypes.Underline,
  S: ApiMessageEntityTypes.Strike,
  STRIKE: ApiMessageEntityTypes.Strike,
  DEL: ApiMessageEntityTypes.Strike,
  CODE: ApiMessageEntityTypes.Code,
  PRE: ApiMessageEntityTypes.Pre,
  BLOCKQUOTE: ApiMessageEntityTypes.Blockquote,
};

const MAX_TAG_DEEPNESS = 3;
const MAX_MESSAGE_LENGTH = 4096;

export default function parseMessageInput(html: string) {
  const fragment = document.createElement('div');
  fragment.innerHTML = parseMarkdown(html);
  const rawText = fragment.innerText.trim().slice(0, MAX_MESSAGE_LENGTH);
  let textIndex = 0;
  let recursionDeepness = 0;
  const entities: ApiMessageEntity[] = [];

  function addEntity(node: ChildNode) {
    const { index, entity } = getEntityDataFromNode(node, rawText, textIndex);

    if (entity) {
      textIndex = index;
      entities.push(entity);
    } else if (node.textContent) {
      textIndex += node.textContent.length;
    }

    if (node.hasChildNodes() && recursionDeepness <= MAX_TAG_DEEPNESS) {
      recursionDeepness += 1;
      Array.from(node.childNodes).forEach(addEntity);
    }
  }

  Array.from(fragment.childNodes).forEach((node) => {
    recursionDeepness = 1;
    addEntity(node);
  });

  return {
    rawText,
    entities: entities.length ? entities : undefined,
  };
}

function parseMarkdown(html: string) {
  let parsedHtml = html.slice(0);

  // Strip redundant <span> tags
  parsedHtml = parsedHtml.replace(/<\/?span([^>]*)?>/g, '');

  // Strip redundant nbsp's
  parsedHtml = parsedHtml.replace(/&nbsp;/g, ' ');

  // Replace <br> with newline
  parsedHtml = parsedHtml.replace(/<br([^>]*)?>/g, '\n');

  // Strip redundant <div> tags
  parsedHtml = parsedHtml.replace(/<\/div>(\s*)<div>/g, '\n');
  parsedHtml = parsedHtml.replace(/<\/?div>/g, '');

  // Pre
  parsedHtml = parsedHtml.replace(/^`{3}(.*[\n\r][^]*?^)`{3}/gm, '<pre>$1</pre>\n\n');
  parsedHtml = parsedHtml.replace(/[`]{3}([^`]+)[`]{3}/g, '<pre>$1</pre>\n\n');

  // Code
  parsedHtml = parsedHtml.replace(/[`]{1}([^`\n]+)[`]{1}/g, '<code>$1</code>');

  // Other simple markdown
  parsedHtml = parsedHtml.replace(/[*]{2}([^*\n]+)[*]{2}/g, '<b>$1</b>');
  parsedHtml = parsedHtml.replace(/[*]{1}([^*\n]+)[*]{1}/g, '<i>$1</i>');
  parsedHtml = parsedHtml.replace(/[~]{2}([^~\n]+)[~]{2}/g, '<s>$1</s>');

  // Hashtags
  parsedHtml = parsedHtml.replace(
    /[#]{1}([^#]+)\s/g,
    `<span data-entity-type="${ApiMessageEntityTypes.Hashtag}">$1</span>`,
  );

  // Email
  parsedHtml = parsedHtml.replace(
    /^((?:(?!\.)[\w-_.]*[^.])(?:@\w+)(?:\.\w+(\.\w+)?[^.\W]))$/gi,
    '<a href="mailto:$1">$1</a>',
  );

  // Phone
  parsedHtml = parsedHtml.replace(/((?:[+]?\d{1,2}[-\s]?|)\d{3}[-\s]?\d{3}[-\s]?\d{4})/g, '<a href="tel:$1">$1</a>');

  return parsedHtml;
}

function getEntityDataFromNode(node: ChildNode, rawText: string, textIndex: number) {
  const type = getEntityTypeFromNode(node);
  if (!type || !node.textContent) {
    return {
      index: textIndex,
      entity: undefined,
    };
  }

  const index = rawText.indexOf(node.textContent, textIndex);
  const offset = rawText.substring(0, index).length;
  const { length } = rawText.substring(index, index + node.textContent.length);

  let url: string | undefined;
  if (type === ApiMessageEntityTypes.TextUrl) {
    url = (node as HTMLAnchorElement).href;
  }

  return {
    index,
    entity: {
      type,
      offset,
      length,
      ...(url && { url }),
    },
  };
}

function getEntityTypeFromNode(node: ChildNode) {
  if (ENTITY_CLASS_BY_NODE_NAME[node.nodeName]) {
    return ENTITY_CLASS_BY_NODE_NAME[node.nodeName];
  }

  if (node.nodeName === 'A') {
    const anchor = node as HTMLAnchorElement;
    if (anchor.href.startsWith('mailto:')) {
      return ApiMessageEntityTypes.Email;
    }
    if (anchor.href.startsWith('tel:')) {
      return ApiMessageEntityTypes.Phone;
    }
    if (anchor.href !== anchor.textContent) {
      return ApiMessageEntityTypes.TextUrl;
    }

    return ApiMessageEntityTypes.Url;
  }

  if (node.nodeName === 'SPAN') {
    return (node as HTMLElement).dataset['data-entity-type'];
  }

  return undefined;
}