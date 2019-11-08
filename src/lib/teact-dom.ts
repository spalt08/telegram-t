// import ReactDOM from 'react-dom';
// export default ReactDOM;

import {
  hasElementChanged,
  isComponentElement, isEmptyElement, isRealElement, isTextElement, isTagElement, VIRTUAL_ELEMENT_EMPTY,
  VirtualElement, VirtualElementChild, VirtualElementComponent,
} from './teact';

let $currentRoot: VirtualElementComponent;

function render($element: VirtualElementComponent, parentEl: HTMLElement | null) {
  if (!parentEl) {
    return;
  }

  renderWithVirtual(parentEl, 0, $currentRoot, $element);

  $currentRoot = $element;
}

function renderWithVirtual(
  parentEl: HTMLElement,
  childIndex: number,
  $current: VirtualElementChild | undefined,
  $new: VirtualElementChild,
) {

  const currentEl = parentEl.childNodes[childIndex];

  if ($current === undefined && $new !== undefined) {
    parentEl.appendChild(createNode($new, parentEl, childIndex));
  } else if ($current !== undefined && $new === undefined) {
    parentEl.removeChild(currentEl);
  } else if ($current !== undefined && $new !== undefined) {
    if (hasElementChanged($current, $new)) {
      parentEl.replaceChild(createNode($new, parentEl, childIndex), currentEl);
    } else if (isRealElement($current) && isRealElement($new)) {
      if (isTagElement($current)) {
        updateAttributes($current, $new, currentEl as HTMLElement);
      }

      if (isComponentElement($new)) {
        renderWithVirtual(parentEl, childIndex, getActualPrevElement($current.children[0]), $new.children[0]);
      } else {
        renderChildren($current, $new, currentEl as HTMLElement);
      }
    }
  }
}

function initComponentElement($element: VirtualElementComponent, parentEl: HTMLElement, childIndex: number) {
  $element.componentInstance.onUpdate = ($previous: VirtualElementComponent, $updated: VirtualElementComponent) => {
    renderWithVirtual(parentEl, childIndex, $previous, $updated);
  };

  return $element.children.length ? $element : $element.componentInstance.render();
}

// Child components tree is always changed on each render so we need to get updated reference for `prevElement`.
function getActualPrevElement($element: VirtualElementChild): VirtualElementChild {
  return isComponentElement($element) ? $element.componentInstance.$prevElement : $element;
}

function createNode($element: VirtualElementChild, parentEl: HTMLElement, childIndex: number): Node {
  if (isEmptyElement($element)) {
    return document.createTextNode('');
  }

  if (isTextElement($element)) {
    return document.createTextNode($element);
  }

  if (isComponentElement($element)) {
    $element = initComponentElement($element, parentEl, childIndex);
    return createNode($element.children[0] as VirtualElementChild, parentEl, childIndex);
  }

  const { tag, props, children = [] } = $element;
  const element = document.createElement(tag);

  if (isTagElement($element)) {
    Object.keys(props).forEach((key) => {
      addAttribute(element, key, props[key]);
    });
  }

  children.forEach(($child, i) => {
    renderWithVirtual(element, i, undefined, $child);
  });

  return element;
}

function renderChildren($current: VirtualElement, $new: VirtualElement, currentEl: HTMLElement) {
  const currentLength = isRealElement($current) ? $current.children.length : 0;
  const newLength = isRealElement($new) ? $new.children.length : 0;
  const maxLength = Math.max(currentLength, newLength);

  for (let i = 0; i < maxLength; i++) {
    const $currentChild = getActualPrevElement($current.children[i]);

    renderWithVirtual(
      currentEl,
      i,
      $currentChild,
      isRealElement($new) ? $new.children[i] : VIRTUAL_ELEMENT_EMPTY,
    );
  }
}

function updateAttributes($current: VirtualElement, $new: VirtualElement, element: HTMLElement) {
  const currentKeys = Object.keys($current.props);
  const newKeys = Object.keys($new.props);

  currentKeys.forEach((key) => {
    if (!$new.props.hasOwnProperty(key)) {
      removeAttribute(element, key, $current.props[key]);
    }
  });

  newKeys.forEach((key) => {
    if (hasAttribute(element, key)) {
      if ($current.props[key] !== $new.props[key]) {
        removeAttribute(element, key, $current.props[key]);
      }
    }

    addAttribute(element, key, $new.props[key]);
  });
}

function hasAttribute(element: HTMLElement, key: string) {
  if (key === 'className') {
    return typeof element.className !== 'undefined';
  } else if (key.startsWith('on')) {
    // There is no way to check event listener, so there will be some redundant removes, but it is fine.
    return true;
  } else {
    element.hasAttribute(key);
  }
}

function addAttribute(element: HTMLElement, key: string, value: any) {
  if (key === 'className') {
    element.className = value;
  } else if (key.startsWith('on')) {
    element.addEventListener(key.replace(/^on/, '').toLowerCase(), value);

    if (key === 'onChange') {
      setupAdditionalOnChangeHandlers(element, value);
    }
  } else {
    element.setAttribute(key, value);
  }
}

function removeAttribute(element: HTMLElement, key: string, value: any) {
  if (key === 'className') {
    element.className = '';
  } else if (key.startsWith('on')) {
    element.removeEventListener(key.replace(/^on/, '').toLowerCase(), value);

    if (key === 'onChange') {
      removeAdditionalOnChangeHandlers(element, value);
    }
  } else {
    element.removeAttribute(key);
  }
}

function setupAdditionalOnChangeHandlers(element: HTMLElement, handler: EventHandlerNonNull) {
  element.addEventListener('input', handler);
  element.addEventListener('paste', handler);
}

function removeAdditionalOnChangeHandlers(element: HTMLElement, handler: EventHandlerNonNull) {
  element.removeEventListener('paste', handler);
  element.removeEventListener('input', handler);
}

export default { render };
