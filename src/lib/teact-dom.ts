import {
  hasElementChanged,
  isComponentElement,
  isEmptyElement,
  isRealElement,
  isTextElement,
  mountComponent,
  unmountTree,
  renderComponent,
  VirtualElement,
  VirtualElementComponent,
  VirtualRealElement,
} from './teact';

type VirtualDomHead = {
  children: [VirtualElement] | [];
};

const $head: VirtualDomHead = { children: [] };

function render($element: VirtualElement, parentEl: HTMLElement | null) {
  if (!parentEl) {
    return;
  }

  $head.children = [renderWithVirtual(parentEl, undefined, $element, [0]) as VirtualElement];
}

function renderWithVirtual(
  parentEl: HTMLElement,
  $current: VirtualElement | undefined,
  $new: VirtualElement | undefined,
  path: number[],
  skipComponentUpdate = false,
) {
  if (
    !skipComponentUpdate
    && $current && $new
    && isComponentElement($current) && isComponentElement($new)
    && !hasElementChanged($current, $new)
  ) {
    $new = updateComponent($current, $new);
  }

  if ($current === $new) {
    return $new;
  }

  if (!$current && $new) {
    $new = initComponent($new, parentEl, path);
    $new.target = createNode($new, parentEl, path);
    parentEl.appendChild($new.target);
  } else if ($current && !$new) {
    unmountTree($current);
    parentEl.removeChild($current.target!);
  } else if ($current && $new) {
    if (hasElementChanged($current, $new)) {
      unmountTree($current);
      $new = initComponent($new, parentEl, path);
      $new.target = createNode($new, parentEl, path);
      parentEl.replaceChild($new.target, $current.target!);
    } else {
      const areComponents = isComponentElement($current) && isComponentElement($new);

      if (!areComponents) {
        $new.target = $current.target;
      }

      if (isRealElement($current) && isRealElement($new)) {
        if (!areComponents) {
          updateAttributes($current, $new, $current.target as HTMLElement);
        }

        $new.children = renderChildren(
          $current,
          $new,
          areComponents ? parentEl : $current.target as HTMLElement,
          path,
        );
      }
    }
  }

  return $new;
}

function initComponent($element: VirtualElement, parentEl: HTMLElement, path: number[]) {
  if (!isComponentElement($element)) {
    return $element;
  }

  const { componentInstance } = $element;

  if (!componentInstance.isMounted) {
    componentInstance.onUpdate = () => {
      const [$parent, index] = findParent(path);
      $parent.children[index] = renderWithVirtual(
        parentEl,
        $parent.children[index],
        componentInstance.$element,
        path,
        true,
      ) as VirtualElementComponent;
    };

    $element = mountComponent(componentInstance);

    const $firstChild = $element.children[0];
    if (isComponentElement($firstChild)) {
      $element.children = [initComponent($firstChild, parentEl, continuePath(path, 0))];
    }

    componentInstance.isMounted = true;
  }

  return $element;
}

function updateComponent($current: VirtualElementComponent, $new: VirtualElementComponent) {
  $current.componentInstance.props = $new.componentInstance.props;
  $current.componentInstance.children = $new.componentInstance.children;

  return renderComponent($current.componentInstance);
}

function continuePath(path: number[], index: number) {
  return path.concat([index]);
}

function findParent(path: number[]): [VirtualRealElement, number] {
  const parent = path.slice(0, -1).reduce((current: VirtualDomHead | VirtualRealElement, childIndex) => {
    return current.children[childIndex] as VirtualDomHead | VirtualRealElement;
  }, $head) as VirtualRealElement;
  const lastIndex = path[path.length - 1];

  return [parent, lastIndex];
}

function createNode($element: VirtualElement, parentEl: HTMLElement, path: number[]): Node {
  if (isEmptyElement($element)) {
    return document.createTextNode('');
  }

  if (isTextElement($element)) {
    return document.createTextNode($element.value);
  }

  if (isComponentElement($element)) {
    return createNode($element.children[0] as VirtualElement, parentEl, continuePath(path, 0));
  }

  const { tag, props, children = [] } = $element;
  const element = document.createElement(tag);

  Object.keys(props).forEach((key) => {
    addAttribute(element, key, props[key]);
  });

  $element.children = children.map(($child, i) => (
    renderWithVirtual(element, undefined, $child, continuePath(path, i)) as VirtualElement
  ));

  return element;
}

function renderChildren(
  $current: VirtualRealElement, $new: VirtualRealElement, currentEl: HTMLElement, path: number[],
) {
  const maxLength = Math.max($current.children.length, $new.children.length);
  const newChildren = [];

  for (let i = 0; i < maxLength; i++) {
    const $newChild = renderWithVirtual(
      currentEl,
      $current.children[i],
      $new.children[i],
      continuePath(path, i),
    );

    if ($newChild) {
      newChildren.push($newChild);
    }
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

  if (key === 'className') {
    element.className = value;
  } else if (key === 'muted') {
    (element as HTMLVideoElement).muted = true;
  } else if (key === 'autoPlay') {
    (element as HTMLVideoElement).autoplay = true;
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
  } else if (key === 'muted') {
    delete (element as HTMLVideoElement).muted;
  } else if (key === 'autoPlay') {
    delete (element as HTMLVideoElement).autoplay;
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
