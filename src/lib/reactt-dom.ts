import {
  isComponentElement, isStringElement, isTagElement,
  VirtualElement,
  VirtualElementChild,
  VirtualElementComponent,
} from './reactt';

let $currentRoot: VirtualElementComponent | undefined;

function render($element: VirtualElement, parentEl: HTMLElement | null) {
  if (!parentEl) {
    return;
  }

  renderWithVirtual(parentEl, 0, $currentRoot, $element, true);
}

function renderWithVirtual(
  parentEl: HTMLElement,
  childIndex: number,
  $current?: VirtualElementChild,
  $new?: VirtualElementChild,
  isRoot: boolean = false,
) {
  if (isComponentElement($new)) {
    $new.onUpdate = ($updated: VirtualElementComponent) => {
      renderChildren($new, $updated, parentEl.childNodes[childIndex] as HTMLElement);
      $new.children = $updated.children;
    };
  }

  const currentEl = parentEl.childNodes[childIndex];

  if (!$current && $new) {
    parentEl.appendChild(createHTMLElement($new));
  } else if ($current && !$new) {
    parentEl.removeChild(currentEl);
  } else if ($current && $new) {
    if (hasElementChanged($current, $new)) {
      parentEl.replaceChild(createHTMLElement($new), currentEl);
    } else {
      renderChildren($current, $new, currentEl as HTMLElement);
    }
  }

  if (isRoot) {
    $currentRoot = $new as VirtualElementComponent;
  }
}

function renderChildren($current: VirtualElementChild, $new: VirtualElementChild, currentEl: HTMLElement) {
  const currentLength = !isStringElement($current) ? $current.children.length : 0;
  const newLength = !isStringElement($new) ? $new.children.length : 0;
  const maxLength = Math.max(currentLength, newLength);

  for (let i = 0; i < maxLength; i++) {
    renderWithVirtual(
      currentEl,
      i,
      !isStringElement($current) ? $current.children[i] : undefined,
      !isStringElement($new) ? $new.children[i] : undefined,
    );
  }
}

function hasElementChanged($old: VirtualElementChild, $new: VirtualElementChild) {
  if (typeof $old !== typeof $new) {
    return true;
  } else if (isStringElement($old) && isStringElement($new)) {
    return $old !== $new;
  } else if (!isStringElement($old) && !isStringElement($new)) {
    return $old.tag !== $new.tag;
  }
}

function createHTMLElement($element: VirtualElementChild) {
  if (isStringElement($element)) {
    return document.createTextNode($element);
  }

  const { tag, props, children = [] } = $element;
  const element = document.createElement(tag);

  if (isTagElement($element)) {
    Object.keys(props).forEach((key) => {
      if (key === 'className') {
        element.className = props[key];
      } else if (key.startsWith('on')) {
        element.addEventListener(key.replace(/^on/, '').toLowerCase(), props[key], false);

        if (key === 'onChange') {
          setupAdditionalOnChangeHandlers(element, props[key]);
        }
      } else {
        element.setAttribute(key, props[key]);
      }
    });
  }

  children.forEach(($child, i) => {
    renderWithVirtual(element, i, undefined, $child);
  });

  return element;
}

function setupAdditionalOnChangeHandlers(element: HTMLElement, handler: EventHandlerNonNull) {
  element.addEventListener('input', handler);
  element.addEventListener('paste', handler);
}

export default { render };
