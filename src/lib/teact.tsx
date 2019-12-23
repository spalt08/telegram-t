import { onNextTick, throttleWithRaf } from '../util/schedulers';
import { flatten } from '../util/iteratees';
import arePropsShallowEqual from '../util/arePropsShallowEqual';

export type Props = AnyLiteral;
export type FC<P extends Props = any> = (props: P) => any;
type AnyFunction = (...args: any) => any;

export enum VirtualElementTypesEnum {
  Empty,
  Text,
  Tag,
  Component,
}

interface VirtualElementEmpty {
  type: VirtualElementTypesEnum.Empty;
  target?: Node;
}

interface VirtualElementText {
  type: VirtualElementTypesEnum.Text;
  target?: Node;
  value: string;
}

export interface VirtualElementTag {
  type: VirtualElementTypesEnum.Tag;
  target?: Node;
  tag: string;
  props: Props;
  children: VirtualElementChildren;
}

export interface VirtualElementComponent {
  type: VirtualElementTypesEnum.Component;
  target?: Node;
  targetAsPrev?: Node;
  componentInstance: ComponentInstance;
  props: Props;
  children: VirtualElementChildren;
}

interface ComponentInstance {
  $element: VirtualElementComponent;
  $prevElement: VirtualElementComponent;
  Component: FC;
  name: string;
  props: Props;
  children: VirtualElementChildren;
  render: () => VirtualElementComponent;
  renderedValue?: any;
  isRendered: () => boolean;
  isUnmounted: boolean;
  hooks: {
    state: {
      cursor: number;
      byCursor: {
        value: any;
        setter: Function;
      }[];
    };
    effects: {
      cursor: number;
      byCursor: {
        effect: () => void;
        dependencies?: any[];
        cleanup?: Function;
      }[];
    };
    refs: {
      cursor: number;
      byCursor: {
        current: any;
      }[];
    };
    callbacks: {
      cursor: number;
      byCursor: {
        callback: AnyFunction;
        dependencies: any[];
      }[];
    };
  };
  forceUpdate: Function;
  onUpdate?: Function;
}

export type VirtualElement = VirtualElementEmpty | VirtualElementText | VirtualElementTag | VirtualElementComponent;
export type VirtualRealElement = VirtualElementTag | VirtualElementComponent;
export type VirtualElementChildren = VirtualElement[];

const EMPTY_COMPONENT_CHILDREN: any[] = [];

let renderingInstance: ComponentInstance;

export function isEmptyElement($element: VirtualElement): $element is VirtualElementEmpty {
  return $element.type === VirtualElementTypesEnum.Empty;
}

export function isTextElement($element: VirtualElement): $element is VirtualElementText {
  return $element.type === VirtualElementTypesEnum.Text;
}

export function isTagElement($element: VirtualElement): $element is VirtualElementTag {
  return $element.type === VirtualElementTypesEnum.Tag;
}

export function isComponentElement($element: VirtualElement): $element is VirtualElementComponent {
  return $element.type === VirtualElementTypesEnum.Component;
}

export function isRealElement($element: VirtualElement): $element is VirtualRealElement {
  return isTagElement($element) || isComponentElement($element);
}

function createElement(
  tagOrComponent: string | FC,
  props: Props,
  ...children: any[]
): VirtualRealElement {
  if (!props) {
    props = {};
  }

  children = flatten(children);

  return typeof tagOrComponent === 'function'
    ? createComponentInstance(tagOrComponent, props, children)
    : buildTagElement(tagOrComponent, props, children);
}

function createComponentInstance(Component: FC, props: Props, children: any[]): VirtualElementComponent {
  const componentInstance: ComponentInstance = {
    $element: {} as VirtualElementComponent,
    $prevElement: {} as VirtualElementComponent,
    Component,
    name: Component.name,
    props,
    children: children.length ? children : EMPTY_COMPONENT_CHILDREN,
    isRendered: () => Boolean(componentInstance.$element.children.length),
    isUnmounted: false,
    hooks: {
      state: {
        cursor: 0,
        byCursor: [],
      },
      effects: {
        cursor: 0,
        byCursor: [],
      },
      refs: {
        cursor: 0,
        byCursor: [],
      },
      callbacks: {
        cursor: 0,
        byCursor: [],
      },
    },
    render: () => renderComponent(componentInstance),
    forceUpdate: throttleWithRaf((newProps?: Props) => {
      if (newProps) {
        componentInstance.props = newProps;
      }

      if (componentInstance.onUpdate && !componentInstance.isUnmounted) {
        const currentElement = componentInstance.$element;
        componentInstance.render();

        if (componentInstance.$element !== currentElement) {
          componentInstance.onUpdate(componentInstance.$prevElement, componentInstance.$element);
        }
      }
    }),
  };

  componentInstance.$element = buildComponentElement(componentInstance);

  return componentInstance.$element;
}

function buildComponentElement(
  componentInstance: ComponentInstance,
  children: VirtualElementChildren = [],
): VirtualElementComponent {
  const { props } = componentInstance;

  return {
    componentInstance,
    type: VirtualElementTypesEnum.Component,
    props,
    children,
    get target() {
      return this.children[0].target;
    },
    get targetAsPrev() {
      const $firstChild = this.children[0];
      return isComponentElement($firstChild)
        ? $firstChild.componentInstance.$prevElement.targetAsPrev
        : $firstChild.target;
    },
    set target(value) {
      this.children[0].target = value;
    },
  };
}

function buildTagElement(tag: string, props: Props, children: any[]): VirtualElementTag {
  return {
    type: VirtualElementTypesEnum.Tag,
    tag,
    props,
    children: children.map(buildChildElement),
  };
}

function buildChildElement(child: any): VirtualElement {
  if (child === false || child === null || child === undefined) {
    return buildEmptyElement();
  } else if (isRealElement(child)) {
    return child;
  } else {
    return buildTextElement(child);
  }
}

function buildTextElement(value: string): VirtualElementText {
  return {
    type: VirtualElementTypesEnum.Text,
    value,
  };
}

function buildEmptyElement(): VirtualElementEmpty {
  return { type: VirtualElementTypesEnum.Empty };
}

function renderComponent(componentInstance: ComponentInstance) {
  renderingInstance = componentInstance;
  componentInstance.hooks.state.cursor = 0;
  componentInstance.hooks.effects.cursor = 0;
  componentInstance.hooks.refs.cursor = 0;
  componentInstance.hooks.callbacks.cursor = 0;

  const { Component, props, children } = componentInstance;
  const newRenderedValue = Component({
    ...props,
    children,
  });

  if (componentInstance.isRendered() && newRenderedValue === componentInstance.renderedValue) {
    componentInstance.$prevElement = componentInstance.$element;
    return componentInstance.$element;
  }

  componentInstance.renderedValue = newRenderedValue;

  const newChild = buildChildElement(newRenderedValue);
  const renderedChildren = replaceChildren(componentInstance.$element, [newChild]);
  componentInstance.$prevElement = componentInstance.$element;
  componentInstance.$element = buildComponentElement(componentInstance, renderedChildren);

  return componentInstance.$element;
}

function replaceChildren($element: VirtualRealElement, newChildren: VirtualElementChildren) {
  const currentLength = $element.children.length;
  const newLength = newChildren.length;
  const maxLength = Math.max(currentLength, newLength);

  const children: VirtualElementChildren = [];
  for (let i = 0; i < maxLength; i++) {
    const updatedChild = replaceChild($element.children[i], newChildren[i]);
    if (updatedChild) {
      children.push(updatedChild);
    }
  }
  return children;
}

function replaceChild(
  $currentChild?: VirtualElement,
  $newChild?: VirtualElement,
) {
  if ($currentChild && $newChild && !hasElementChanged($currentChild, $newChild)) {
    if (isComponentElement($currentChild) && isComponentElement($newChild)) {
      $currentChild.componentInstance.props = $newChild.componentInstance.props;
      $currentChild.componentInstance.children = $newChild.componentInstance.children;

      return $currentChild.componentInstance.render();
    } else if (isTagElement($currentChild) && isTagElement($newChild)) {
      $newChild.children = replaceChildren($currentChild, $newChild.children);

      return $newChild;
    }
  }

  if ($currentChild && isRealElement($currentChild)) {
    unmountTree($currentChild);
  }

  return $newChild && isComponentElement($newChild)
    ? $newChild.componentInstance.render()
    : $newChild;
}

export function hasElementChanged($old: VirtualElement, $new: VirtualElement) {
  if (typeof $old !== typeof $new) {
    return true;
  } else if ($old.type !== $new.type) {
    return true;
  } else if (isTextElement($old) && isTextElement($new)) {
    return $old.value !== $new.value;
  } else if (isTagElement($old) && isTagElement($new)) {
    return ($old.tag !== $new.tag) || ($old.props.key !== $new.props.key);
  } else if (isComponentElement($old) && isComponentElement($new)) {
    return (
      $old.componentInstance.Component !== $new.componentInstance.Component
    ) || (
      $old.props.key !== $new.props.key
    );
  }

  return false;
}

function unmountTree($element: VirtualElement) {
  if (isComponentElement($element)) {
    unmountComponent($element.componentInstance);
    $element = $element.componentInstance.$element;
  }

  if ('children' in $element) {
    $element.children.forEach(unmountTree);
  }
}

function unmountComponent(componentInstance: ComponentInstance) {
  componentInstance.hooks.effects.byCursor.forEach(({ cleanup }) => {
    if (typeof cleanup === 'function') {
      cleanup();
    }
  });
  delete componentInstance.hooks.state;
  delete componentInstance.hooks.effects;
  delete componentInstance.hooks.refs;
  delete componentInstance.hooks.callbacks;
  componentInstance.isUnmounted = true;
}

export function useState(initial?: any) {
  const { cursor, byCursor } = renderingInstance.hooks.state;

  if (byCursor[cursor] === undefined) {
    byCursor[cursor] = {
      value: initial,
      setter: ((componentInstance) => (newValue: any) => {
        if (byCursor[cursor].value !== newValue) {
          byCursor[cursor].value = newValue;
          componentInstance.forceUpdate();
        }
      })(renderingInstance),
    };
  }

  renderingInstance.hooks.state.cursor++;

  return [
    byCursor[cursor].value,
    byCursor[cursor].setter,
  ];
}

export function useEffect(effect: () => Function | void, dependencies?: any[]) {
  const { cursor, byCursor } = renderingInstance.hooks.effects;
  const { cleanup } = byCursor[cursor] || {};

  const exec = () => {
    if (typeof cleanup === 'function') {
      cleanup();
    }

    byCursor[cursor].cleanup = effect() as Function;
  };

  if (byCursor[cursor] !== undefined && dependencies && byCursor[cursor].dependencies) {
    if (dependencies.some((dependency, i) => dependency !== byCursor[cursor].dependencies![i])) {
      onNextTick(exec);
    }
  } else {
    onNextTick(exec);
  }

  byCursor[cursor] = {
    effect,
    dependencies,
    cleanup,
  };

  renderingInstance.hooks.effects.cursor++;
}

// TODO Support in `teact-dom`.
export function useRef(initial?: any) {
  const { cursor, byCursor } = renderingInstance.hooks.refs;

  if (byCursor[cursor] === undefined) {
    byCursor[cursor] = {
      current: initial,
    };
  }

  renderingInstance.hooks.refs.cursor++;

  return byCursor[cursor];
}

export function useCallback<F extends AnyFunction>(newCallback: F, dependencies: any[]): F {
  const { cursor, byCursor } = renderingInstance.hooks.callbacks;
  let { callback } = byCursor[cursor] || {};

  if (
    byCursor[cursor] === undefined
    || dependencies.some((dependency, i) => dependency !== byCursor[cursor].dependencies[i])
  ) {
    callback = newCallback;
  }

  byCursor[cursor] = {
    callback,
    dependencies,
  };

  renderingInstance.hooks.callbacks.cursor++;

  return callback as F;
}

export function memo(Component: FC, areEqual = arePropsShallowEqual): FC {
  return function MemoWrapper(props: Props) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const propsRef = useRef(props);
    const renderedRef = useRef();

    if (!renderedRef.current || !areEqual(propsRef.current, props)) {
      propsRef.current = props;
      renderedRef.current = createElement(Component, props) as VirtualElementComponent;
    }

    return renderedRef.current;
  };
}

// We need to keep it here for JSX.
export default {
  createElement,
};
