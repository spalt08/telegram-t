import {
  hasElementChanged,
  isComponentElement,
  isEmptyElement,
  isRealElement,
  isTextElement,
  mountComponent,
  renderComponent,
  unmountTree,
  getTarget,
  setTarget,
  VirtualElement,
  VirtualElementComponent,
  VirtualElementTag,
  VirtualRealElement,
} from './teact';

type VirtualDomHead = {
  children: [VirtualElement] | [];
};

const FILTERED_ATTRIBUTES = new Set(['key', 'ref', 'teactChildrenKeyOrder']);
const MAPPED_ATTRIBUTES: { [k: string]: string } = {
  autoPlay: 'autoplay',
  autoComplete: 'autocomplete',
};

const $head: VirtualDomHead = { children: [] };
let DEBUG_virtualTreeSize = 1;

function render($element: VirtualElement, parentEl: HTMLElement | null) {
  if (!parentEl) {
    return undefined;
  }

  $head.children = [renderWithVirtual(parentEl, undefined, $element, $head, 0) as VirtualElement];

  if (process.env.NODE_ENV === 'perf') {
    DEBUG_virtualTreeSize = 0;
    DEBUG_addToVirtualTreeSize($head);

    return DEBUG_virtualTreeSize;
  }

  return undefined;
}

function renderWithVirtual(
  parentEl: HTMLElement,
  $current: VirtualElement | undefined,
  $new: VirtualElement | undefined,
  $parent: VirtualRealElement | VirtualDomHead,
  index: number,
  skipComponentUpdate = false,
  insertAfterOrPrepend?: Element | 'prepend',
) {
  if (
    !skipComponentUpdate
    && $current && $new
    && isComponentElement($current) && isComponentElement($new)
    && !hasElementChanged($current, $new)
  ) {
    $new = updateComponent($current, $new);
  }

  // Parent element may have changed, so we need to update the listener closure.
  if (!skipComponentUpdate && $new && isComponentElement($new) && $new.componentInstance.isMounted) {
    setupComponentUpdateListener($new, $parent, index, parentEl);
  }

  if ($current === $new) {
    return $new;
  }

  if (!$current && $new) {
    if (isComponentElement($new)) {
      $new = initComponent($new, $parent, index, parentEl);
    }

    const node = createNode($new);
    setTarget($new, node);

    if (insertAfterOrPrepend === 'prepend' && parentEl.firstChild) {
      parentEl.insertBefore(node, parentEl.firstChild);
    } else if ((insertAfterOrPrepend instanceof Element) && insertAfterOrPrepend.nextSibling) {
      parentEl.insertBefore(node, insertAfterOrPrepend.nextSibling);
    } else {
      parentEl.appendChild(node);
    }
  } else if ($current && !$new) {
    unmountTree($current);
    parentEl.removeChild(getTarget($current)!);
  } else if ($current && $new) {
    if (hasElementChanged($current, $new)) {
      unmountTree($current);
      if (isComponentElement($new)) {
        $new = initComponent($new, $parent, index, parentEl);
      }

      const node = createNode($new);
      setTarget($new, node);
      parentEl.replaceChild(node, getTarget($current)!);
    } else {
      const areComponents = isComponentElement($current) && isComponentElement($new);

      if (!areComponents) {
        setTarget($new, getTarget($current)!);
      }

      if (isRealElement($current) && isRealElement($new)) {
        if (!areComponents) {
          updateAttributes($current, $new, getTarget($current) as HTMLElement);
        }

        $new.children = renderChildren(
          $current,
          $new,
          areComponents ? parentEl : getTarget($current) as HTMLElement,
        );
      }
    }
  }

  return $new;
}

function initComponent(
  $element: VirtualElementComponent, $parent: VirtualRealElement | VirtualDomHead, index: number, parentEl: HTMLElement,
) {
  if (!isComponentElement($element)) {
    return $element;
  }

  const { componentInstance } = $element;

  if (!componentInstance.isMounted) {
    $element = mountComponent(componentInstance);
    setupComponentUpdateListener($element, $parent, index, parentEl);

    const $firstChild = $element.children[0];
    if (isComponentElement($firstChild)) {
      $element.children = [initComponent($firstChild, $element, 0, parentEl)];
    }

    componentInstance.isMounted = true;
  }

  return $element;
}

function updateComponent($current: VirtualElementComponent, $new: VirtualElementComponent) {
  $current.componentInstance.props = $new.componentInstance.props;

  return renderComponent($current.componentInstance);
}

function setupComponentUpdateListener(
  $element: VirtualElementComponent, $parent: VirtualRealElement | VirtualDomHead, index: number, parentEl: HTMLElement,
) {
  const { componentInstance } = $element;

  componentInstance.onUpdate = () => {
    $parent.children[index] = renderWithVirtual(
      parentEl,
      $parent.children[index],
      componentInstance.$element,
      $parent,
      index,
      true,
    ) as VirtualElementComponent;
  };
}

function createNode($element: VirtualElement): Node {
  if (isEmptyElement($element)) {
    return document.createTextNode('');
  }

  if (isTextElement($element)) {
    return document.createTextNode($element.value);
  }

  if (isComponentElement($element)) {
    return createNode($element.children[0] as VirtualElement);
  }

  const { tag, props, children = [] } = $element;
  const element = document.createElement(tag);

  if (typeof props.ref === 'object') {
    props.ref.current = element;
  }

  Object.keys(props).forEach((key) => {
    addAttribute(element, key, props[key]);
  });

  $element.children = children.map(($child, i) => (
    renderWithVirtual(element, undefined, $child, $element, i) as VirtualElement
  ));

  return element;
}

function renderChildren(
  $current: VirtualRealElement, $new: VirtualRealElement, currentEl: HTMLElement,
) {
  if ($new.props.teactChildrenKeyOrder === 'asc') {
    return renderOrderedChildren($current, $new, currentEl);
  }

  const maxLength = Math.max($current.children.length, $new.children.length);
  const newChildren = [];

  for (let i = 0; i < maxLength; i++) {
    const $newChild = renderWithVirtual(
      currentEl,
      $current.children[i],
      $new.children[i],
      $new,
      i,
    );

    if ($newChild) {
      newChildren.push($newChild);
    }
  }

  return newChildren;
}

// A simple diff algorithm for two ordered lists. This is different to React which supports diffs for any keyed lists.
function renderOrderedChildren(
  $current: VirtualRealElement, $new: VirtualRealElement, currentEl: HTMLElement,
) {
  let prevChild = $current.children[0] as VirtualRealElement;
  let nextChild = $new.children[0] as VirtualRealElement;
  let prevI = 0;
  let nextI = 0;

  const newChildren = [];
  let i = 0;

  let insertAfterOrPrepend: Element | 'prepend' = 'prepend';

  while (prevChild || nextChild) {
    if (nextChild && (!prevChild || nextChild.props.key < prevChild.props.key)) {
      const newChild = renderWithVirtual(
        currentEl, undefined, nextChild, $new, i, false, insertAfterOrPrepend,
      ) as VirtualElementTag;
      newChildren.push(newChild);
      insertAfterOrPrepend = getTarget(newChild) as Element;

      nextI++;
      nextChild = $new.children[nextI] as VirtualRealElement;
    } else if (prevChild && (!nextChild || nextChild.props.key > prevChild.props.key)) {
      renderWithVirtual(currentEl, prevChild, undefined, $new, i);

      prevI++;
      prevChild = $current.children[prevI] as VirtualRealElement;
    } else {
      const newChild = renderWithVirtual(currentEl, prevChild, nextChild, $new, i) as VirtualElementTag;
      newChildren.push(newChild);
      insertAfterOrPrepend = getTarget(newChild) as Element;

      prevI++;
      prevChild = $current.children[prevI] as VirtualRealElement;
      nextI++;
      nextChild = $new.children[nextI] as VirtualRealElement;
    }

    i++;
  }

  return newChildren;
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

  // An optimization attempt.
  if (key === 'className') {
    element.className = value;
  } else if (key === 'style') {
    element.style.cssText = value;
  } else if (key.startsWith('on')) {
    element.addEventListener(key.replace(/^on/, '').toLowerCase(), value);

    if (key === 'onChange') {
      setupAdditionalOnChangeHandlers(element, value);
    }
  } else if (key.startsWith('data-')) {
    element.setAttribute(key, value);
  } else if (!FILTERED_ATTRIBUTES.has(key)) {
    (element as any)[MAPPED_ATTRIBUTES[key] || key] = value;
  }
}

function removeAttribute(element: HTMLElement, key: string, value: any) {
  if (key === 'className') {
    element.className = '';
  } else if (key === 'style') {
    element.style.cssText = value;
  } else if (key.startsWith('on')) {
    element.removeEventListener(key.replace(/^on/, '').toLowerCase(), value);

    if (key === 'onChange') {
      removeAdditionalOnChangeHandlers(element, value);
    }
  } else if (key.startsWith('data-')) {
    element.removeAttribute(key);
  } else if (!FILTERED_ATTRIBUTES.has(key)) {
    delete (element as any)[MAPPED_ATTRIBUTES[key] || key];
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

function DEBUG_addToVirtualTreeSize($current: VirtualRealElement | VirtualDomHead) {
  DEBUG_virtualTreeSize += $current.children.length;

  $current.children.forEach(($child) => {
    if (isRealElement($child)) {
      DEBUG_addToVirtualTreeSize($child);
    }
  });
}

export default { render };
