// import ReactDOM from 'react-dom';
// export default ReactDOM;

import {
  hasElementChanged,
  isComponentElement, isRealElement, isStringElement, isTagElement,
  VirtualElement,
  VirtualElementChild, VirtualElementChildOrEmpty,
  VirtualElementComponent,
} from './reactt';

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
  $current: VirtualElementChildOrEmpty,
  $new: VirtualElementChildOrEmpty,
) {
  const currentEl = parentEl.childNodes[childIndex];

  if (isComponentElement($new)) {
    if (!$new.children.length) {
      $new = $new.componentInstance.render();
    }

    $new.componentInstance.onUpdate = ($previous: VirtualElementComponent, $updated: VirtualElementComponent) => {
      renderChildren($previous, $updated, parentEl.childNodes[childIndex] as HTMLElement);
    };
  }

  if (!$current && $new) {
    parentEl.appendChild(createHTMLElement($new));
  } else if ($current && !$new) {
    parentEl.removeChild(currentEl);
  } else if ($current && $new) {
    if (hasElementChanged($current, $new)) {
      parentEl.replaceChild(createHTMLElement($new), currentEl);
    } else if (isRealElement($current) && isRealElement($new)) {
      if (isTagElement($current)) {
        updateAttributes($current, $new, currentEl as HTMLElement);
      }

      renderChildren($current, $new, currentEl as HTMLElement);
    }
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
    delete element.className;
  } else if (key.startsWith('on')) {
    element.removeEventListener(key.replace(/^on/, '').toLowerCase(), value);

    if (key === 'onChange') {
      removeAdditionalOnChangeHandlers(element, value);
    }
  } else {
    element.removeAttribute(key);
  }
}

function renderChildren($current: VirtualElement, $new: VirtualElement, currentEl: HTMLElement) {
  const currentLength = isRealElement($current) ? $current.children.length : 0;
  const newLength = isRealElement($new) ? $new.children.length : 0;
  const maxLength = Math.max(currentLength, newLength);

  for (let i = 0; i < maxLength; i++) {
    let $currentChild = isRealElement($current) ? $current.children[i] : undefined;

    // Child components tree is always changed.
    if (isComponentElement($currentChild)) {
      $currentChild = $currentChild.componentInstance.$prevElement;
    }

    renderWithVirtual(
      currentEl,
      i,
      $currentChild,
      isRealElement($new) ? $new.children[i] : undefined,
    );
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
      addAttribute(element, key, props[key]);
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

function removeAdditionalOnChangeHandlers(element: HTMLElement, handler: EventHandlerNonNull) {
  element.removeEventListener('paste', handler);
  element.removeEventListener('input', handler);
}

export default { render };
