import { onNextTick, throttleWithRaf } from '../util/schedulers';
import { flatten } from '../util/iteratees';
import arePropsShallowEqual from '../util/arePropsShallowEqual';

export type Props = AnyLiteral;
export type FC<P extends Props = any> = (props: P) => VirtualElementComponent;

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
  state: ComponentInstanceState;
  effects: ComponentInstanceEffects;
  refs: ComponentInstanceRefs;
  render: () => VirtualElementComponent;
  forceUpdate: Function;
  onUpdate?: Function;
  isUnmounted: boolean;
}

export type VirtualElement = VirtualElementEmpty | VirtualElementText | VirtualElementTag | VirtualElementComponent;
export type VirtualRealElement = VirtualElementTag | VirtualElementComponent;
export type VirtualElementChildren = VirtualElement[];
// Fix for default JSX type error.
export type JsxChildren = VirtualElementChildren | VirtualElement;

interface ComponentInstanceState {
  cursor: number;
  byCursor: {
    value: any;
    setter: Function;
  }[];
}

interface ComponentInstanceEffects {
  cursor: number;
  byCursor: {
    effect: () => void;
    dependencies?: any[];
    cleanup?: Function;
  }[];
}

interface ComponentInstanceRefs {
  cursor: number;
  byCursor: {
    current: any;
  }[];
}

const EMPTY_CHILDREN: any[] = [];

// Used for memoization.
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
  tag: string | FC,
  props: Props,
  ...children: any[]
): VirtualRealElement {
  if (!props) {
    props = {};
  }

  if (typeof tag === 'function') {
    children = flatten(children);

    if (!children.length) {
      children = EMPTY_CHILDREN;
    }

    const componentInstance: ComponentInstance = {
      $element: {} as VirtualElementComponent,
      $prevElement: {} as VirtualElementComponent,
      Component: tag,
      name: tag.name,
      props,
      children,
      isUnmounted: false,
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
      render() {
        const child = renderComponent(componentInstance);

        if (componentInstance.$element.children[0] !== child) {
          const renderedChildren = getUpdatedChildren(componentInstance.$element, [child]);
          componentInstance.$prevElement = componentInstance.$element;
          componentInstance.$element = createComponentElement(componentInstance, renderedChildren);
        } else {
          componentInstance.$prevElement = componentInstance.$element;
        }

        return componentInstance.$element;
      },
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

    componentInstance.$element = createComponentElement(componentInstance);

    return componentInstance.$element;
  }

  return {
    type: VirtualElementTypesEnum.Tag,
    tag,
    props,
    children: flatten(children).map((child: any): VirtualElement => {
      if (child === false || child === null || child === undefined) {
        return createEmptyElement();
      } else if (isRealElement(child)) {
        return child;
      } else {
        return createTextElement(child);
      }
    }),
  };
}

function createEmptyElement(): VirtualElementEmpty {
  return { type: VirtualElementTypesEnum.Empty };
}

function createTextElement(value: string): VirtualElementText {
  return {
    type: VirtualElementTypesEnum.Text,
    value,
  };
}

function createComponentElement(
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
    set target(value) {
      this.children[0].target = value;
    },
  };
}

function renderComponent(componentInstance: ComponentInstance) {
  renderingInstance = componentInstance;
  renderingInstance.state.cursor = 0;

  const { Component, props, children } = componentInstance;

  return Component({
    ...props,
    children,
  });
}

function getUpdatedChildren($element: VirtualRealElement, newChildren: VirtualElementChildren) {
  const currentLength = $element.children.length;
  const newLength = newChildren.length;
  const maxLength = Math.max(currentLength, newLength);

  const children: VirtualElementChildren = [];
  for (let i = 0; i < maxLength; i++) {
    children.push(getUpdatedChild($element, i, $element.children[i], newChildren[i]) || createEmptyElement());
  }
  return children;
}

function getUpdatedChild(
  $element: VirtualRealElement,
  childIndex: number,
  currentChild?: VirtualElement,
  newChild?: VirtualElement,
) {
  if (
    currentChild && isRealElement(currentChild)
    && newChild && isRealElement(newChild)
    && !hasElementChanged(currentChild, newChild)
  ) {
    if (isComponentElement(currentChild) && isComponentElement(newChild)) {
      currentChild.componentInstance.props = newChild.componentInstance.props;
      currentChild.componentInstance.children = newChild.componentInstance.children;
      return currentChild.componentInstance.render();
    } else {
      newChild.children = getUpdatedChildren(currentChild, newChild.children);
    }
  } else {
    if (currentChild) {
      unmountTree(currentChild);
    }

    if (newChild && isComponentElement(newChild)) {
      return newChild.componentInstance.render();
    }
  }

  return newChild;
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
  componentInstance.effects.byCursor.forEach(({ cleanup }) => {
    if (typeof cleanup === 'function') {
      cleanup();
    }
  });
  delete componentInstance.state;
  delete componentInstance.effects;
  delete componentInstance.refs;
  componentInstance.isUnmounted = true;
}

export function useState(initial: any) {
  const { cursor, byCursor } = renderingInstance.state;

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

  renderingInstance.state.cursor++;

  return [
    byCursor[cursor].value,
    byCursor[cursor].setter,
  ];
}

export function useEffect(effect: () => Function | void, dependencies?: any[]) {
  const { cursor, byCursor } = renderingInstance.effects;
  const { cleanup } = byCursor[cursor] || {};

  const exec = () => {
    if (typeof cleanup === 'function') {
      cleanup();
    }

    byCursor[cursor].cleanup = effect() as Function;
  };

  const scheduleFn = renderingInstance.$element.children.length ? onNextTick : requestAnimationFrame;

  if (byCursor[cursor] !== undefined && dependencies && byCursor[cursor].dependencies) {
    if (dependencies.some((dependency, i) => dependency !== byCursor[cursor].dependencies![i])) {
      scheduleFn(exec);
    }
  } else {
    scheduleFn(exec);
  }

  byCursor[cursor] = {
    effect,
    dependencies,
    cleanup,
  };

  renderingInstance.state.cursor++;
}

// TODO Support in `teact-dom`.
export function useRef(initial: any) {
  const { cursor, byCursor } = renderingInstance.refs;

  if (byCursor[cursor] === undefined) {
    byCursor[cursor] = {
      current: initial,
    };
  }

  renderingInstance.state.cursor++;

  return byCursor[cursor];
}

export function memo(Component: FC, areEqual = arePropsShallowEqual): FC {
  return function MemoWrapper(props: Props) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const propsRef = useRef({});
    const renderRef = useRef({});

    if (!renderRef.current || !areEqual(propsRef.current, props)) {
      propsRef.current = props;
      renderRef.current = createElement(Component, props) as VirtualElementComponent;
    }

    return renderRef.current;
  };
}

// We need to keep it here for JSX.
export default {
  createElement,
};
