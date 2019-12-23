import {
  hasElementChanged,
  isComponentElement,
  isEmptyElement,
  isRealElement,
  isTagElement,
  isTextElement,
  VirtualElement,
  VirtualElementComponent,
  VirtualElementTypesEnum,
  VirtualRealElement,
} from './teact';

let $currentRoot: VirtualElementComponent;

function render($element: VirtualElementComponent, parentEl: HTMLElement | null) {
  if (!parentEl) {
    return;
  }

  renderWithVirtual(parentEl, $currentRoot, $element);

  $currentRoot = $element;
}

function renderWithVirtual(
  parentEl: HTMLElement,
  $current: VirtualElement | undefined,
  $new: VirtualElement | undefined,
) {
  if ($current && isComponentElement($current)) {
    // When component element is recursively rendered by its parent, the cached `$current` element is passed from above.
    // However, if that child component element has already been updated earlier, the `$current` would be outdated.
    // That is why we get the updated `$prevElement` right from the component instance.
    $current = $new === undefined || hasElementChanged($current, $new)
      ? $current.componentInstance.$element
      : $current.componentInstance.$prevElement;
  }

  if ($current === $new) {
    return;
  }

  if ($current === undefined && $new !== undefined) {
    $new = initComponent($new, parentEl);
    $new.target = createNode($new, parentEl);
    parentEl.appendChild($new.target);
  } else if ($current !== undefined && $new === undefined) {
    parentEl.removeChild($current.target!);
  } else if ($current !== undefined && $new !== undefined) {
    if (hasElementChanged($current, $new)) {
      $new = initComponent($new, parentEl);
      $new.target = createNode($new, parentEl);
      parentEl.replaceChild($new.target, $current.target!);
    } else {
      $new.target = $current.target;

      if (isTagElement($current) && isTagElement($new)) {
        updateAttributes($current, $new, $current.target as HTMLElement);
        renderChildren($current, $new, $current.target as HTMLElement);
      } else if (isComponentElement($current) && isComponentElement($new)) {
        renderWithVirtual(parentEl, $current.children[0], $new.children[0]);
      }
    }
  }
}

function initComponent($element: VirtualElement, parentEl: HTMLElement) {
  if (!isComponentElement($element)) {
    return $element;
  }

  $element.componentInstance.onUpdate = ($previous: VirtualElementComponent, $updated: VirtualElementComponent) => {
    renderWithVirtual(parentEl, $previous, $updated);
  };

  const $newElement = $element.componentInstance.isRendered() ? $element : $element.componentInstance.render();

  if (isComponentElement($newElement.children[0])) {
    $newElement.children = [initComponent($newElement.children[0], parentEl)];
  }

  return $newElement;
}

function createNode($element: VirtualElement, parentEl: HTMLElement): Node {
  if (isEmptyElement($element)) {
    return document.createTextNode('');
  }

  if (isTextElement($element)) {
    return document.createTextNode($element.value);
  }

  if (isComponentElement($element)) {
    return createNode($element.children[0] as VirtualElement, parentEl);
  }

  const { tag, props, children = [] } = $element;
  const element = document.createElement(tag);

  if (isTagElement($element)) {
    Object.keys(props).forEach((key) => {
      addAttribute(element, key, props[key]);
    });
  }

  children.forEach(($child) => {
    renderWithVirtual(element, undefined, $child);
  });

  return element;
}

function renderChildren($current: VirtualRealElement, $new: VirtualRealElement, currentEl: HTMLElement) {
  const currentLength = isRealElement($current) ? $current.children.length : 0;
  const newLength = isRealElement($new) ? $new.children.length : 0;
  const maxLength = Math.max(currentLength, newLength);

  for (let i = 0; i < maxLength; i++) {
    renderWithVirtual(
      currentEl,
      $current.children[i],
      isRealElement($new) ? $new.children[i] : { type: VirtualElementTypesEnum.Empty },
    );
  }
}

function updateAttributes($current: VirtualRealElement, $new: VirtualRealElement, element: HTMLElement) {
  const currentKeys = Object.keys($current.props);
  const newKeys = Object.keys($new.props);

  currentKeys.forEach((key) => {
    if (!$new.props.hasOwnProperty(key)) {
      removeAttribute(element, key, $current.props[key]);
    }
  });

  newKeys.forEach((key) => {
    if (!$current.props.hasOwnProperty(key)) {
      addAttribute(element, key, $new.props[key]);
    } else if ($current.props[key] !== $new.props[key]) {
      updateAttribute(element, key, $current.props[key], $new.props[key]);
    }
  });
}

function addAttribute(element: HTMLElement, key: string, value: any) {
  if (value === false || value === null || value === undefined) {
    return;
  }

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

function updateAttribute(element: HTMLElement, key: string, oldValue: any, newValue: any) {
  if (key === 'value') {
    // Setting value to '' (as we do with `className`) causes a cursor jump.
    (element as HTMLInputElement).value = newValue;
  } else {
    removeAttribute(element, key, oldValue);
    addAttribute(element, key, newValue);
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
