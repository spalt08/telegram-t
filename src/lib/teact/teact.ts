import { DEBUG, DEBUG_ALERT_MSG } from '../../config';
import { fastRaf, onTickEnd, throttleWithRaf } from '../../util/schedulers';
import { flatten, orderBy } from '../../util/iteratees';
import arePropsShallowEqual from '../../util/arePropsShallowEqual';

export type Props = AnyLiteral;
export type FC<P extends Props = any> = (props: P) => any;

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
  componentInstance: ComponentInstance;
  props: Props;
  children: VirtualElementChildren;
}

export type StateHookSetter<T> = (newValue: ((current: T) => T) | T) => void;

interface ComponentInstance {
  $element: VirtualElementComponent;
  Component: FC;
  name: string;
  props: Props;
  renderedValue?: any;
  isMounted: boolean;
  hooks: {
    state: {
      cursor: number;
      byCursor: {
        value: any;
        setter: StateHookSetter<any>;
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
    memos: {
      cursor: number;
      byCursor: {
        current: any;
        dependencies: any[];
      }[];
    };
  };
  forceUpdate?: () => void;
  onUpdate?: () => void;
}

export type VirtualElement = VirtualElementEmpty | VirtualElementText | VirtualElementTag | VirtualElementComponent;
export type VirtualRealElement = VirtualElementTag | VirtualElementComponent;
export type VirtualElementChildren = VirtualElement[];

const Fragment = Symbol('Fragment');

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
  source: string | FC | typeof Fragment,
  props: Props,
  ...children: any[]
): VirtualRealElement | VirtualElementChildren {
  if (!props) {
    props = {};
  }

  children = flatten(children);

  if (source === Fragment) {
    return children;
  } else if (typeof source === 'function') {
    return createComponentInstance(source, props, children);
  } else {
    return buildTagElement(source, props, children);
  }
}

function createComponentInstance(Component: FC, props: Props, children: any[]): VirtualElementComponent {
  let parsedChildren: any | any[] | undefined;
  if (children.length === 0) {
    parsedChildren = undefined;
  } else if (children.length === 1) {
    [parsedChildren] = children;
  } else {
    parsedChildren = children;
  }

  const componentInstance: ComponentInstance = {
    $element: {} as VirtualElementComponent,
    Component,
    name: Component.name,
    props: {
      ...props,
      ...(parsedChildren && { children: parsedChildren }),
    },
    isMounted: false,
    hooks: {
      state: {
        cursor: 0,
        byCursor: [],
      },
      effects: {
        cursor: 0,
        byCursor: [],
      },
      memos: {
        cursor: 0,
        byCursor: [],
      },
    },
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
  };
}

function buildTagElement(tag: string, props: Props, children: any[]): VirtualElementTag {
  return {
    type: VirtualElementTypesEnum.Tag,
    tag,
    props,
    children: dropEmptyTail(children).map(buildChildElement),
  };
}

// We only need placeholders in the middle of collection (to ensure other elements order).
function dropEmptyTail(children: any[]) {
  let i = children.length - 1;

  for (; i >= 0; i--) {
    if (!isEmptyPlaceholder(children[i])) {
      break;
    }
  }

  return i + 1 < children.length ? children.slice(0, i + 1) : children;
}

function isEmptyPlaceholder(child: any) {
  return child === false || child === null || child === undefined;
}

function buildChildElement(child: any): VirtualElement {
  if (isEmptyPlaceholder(child)) {
    return buildEmptyElement();
  } else if (isRealElement(child)) {
    return child;
  } else {
    return buildTextElement(child);
  }
}

function buildTextElement(value: any): VirtualElementText {
  return {
    type: VirtualElementTypesEnum.Text,
    value: String(value),
  };
}

function buildEmptyElement(): VirtualElementEmpty {
  return { type: VirtualElementTypesEnum.Empty };
}

const DEBUG_components: AnyLiteral = {};

document.addEventListener('dblclick', () => {
  // eslint-disable-next-line no-console
  console.log('COMPONENTS', orderBy(Object.values(DEBUG_components), 'renderCount', 'desc'));
});

export function renderComponent(componentInstance: ComponentInstance) {
  renderingInstance = componentInstance;
  componentInstance.hooks.state.cursor = 0;
  componentInstance.hooks.effects.cursor = 0;
  componentInstance.hooks.memos.cursor = 0;

  const { Component, props } = componentInstance;
  let newRenderedValue;

  try {
    let DEBUG_startAt: number | undefined;
    if (DEBUG) {
      const componentName = componentInstance.name;
      if (!DEBUG_components[componentName]) {
        DEBUG_components[componentName] = {
          componentName,
          renderCount: 0,
          renderTimes: [],
        };
      }

      DEBUG_startAt = performance.now();
    }

    newRenderedValue = Component(props);

    if (DEBUG) {
      const renderTime = performance.now() - DEBUG_startAt!;
      const componentName = componentInstance.name;
      if (renderTime > 7) {
        // eslint-disable-next-line no-console
        console.warn(`[Teact] Slow component render: ${componentName}, ${Math.round(renderTime)} ms`);
      }
      DEBUG_components[componentName].renderTimes.push(renderTime);
      DEBUG_components[componentName].renderCount++;
    }
  } catch (err) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error(err);
      // eslint-disable-next-line no-alert
      window.alert(DEBUG_ALERT_MSG);
    }

    newRenderedValue = componentInstance.renderedValue;
  }

  if (componentInstance.isMounted && newRenderedValue === componentInstance.renderedValue) {
    return componentInstance.$element;
  }

  componentInstance.renderedValue = newRenderedValue;

  const newChild = buildChildElement(newRenderedValue);
  componentInstance.$element = buildComponentElement(componentInstance, [newChild]);

  return componentInstance.$element;
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

export function unmountTree($element: VirtualElement) {
  if (!isRealElement($element)) {
    return;
  }

  if (isComponentElement($element)) {
    unmountComponent($element.componentInstance);
  }

  $element.children.forEach(unmountTree);
}

export function mountComponent(componentInstance: ComponentInstance) {
  renderComponent(componentInstance);
  componentInstance.isMounted = true;
  return componentInstance.$element;
}

function unmountComponent(componentInstance: ComponentInstance) {
  componentInstance.hooks.effects.byCursor.forEach(({ cleanup }) => {
    if (typeof cleanup === 'function') {
      cleanup();
    }
  });
  delete componentInstance.hooks.state;
  delete componentInstance.hooks.effects;
  delete componentInstance.hooks.memos;
  componentInstance.isMounted = false;
}

function forceUpdateComponent(componentInstance: ComponentInstance) {
  if (componentInstance.onUpdate && componentInstance.isMounted) {
    const currentElement = componentInstance.$element;
    renderComponent(componentInstance);

    if (componentInstance.$element !== currentElement) {
      componentInstance.onUpdate();
    }
  }
}

export function getTarget($element: VirtualElement): Node | undefined {
  if (isComponentElement($element)) {
    return getTarget($element.children[0]);
  } else {
    return $element.target;
  }
}

export function setTarget($element: VirtualElement, target: Node) {
  if (isComponentElement($element)) {
    setTarget($element.children[0], target);
  } else {
    $element.target = target;
  }
}

export function useState<T>(initial?: T): [T, StateHookSetter<T>] {
  const { cursor, byCursor } = renderingInstance.hooks.state;

  if (byCursor[cursor] === undefined) {
    byCursor[cursor] = {
      value: initial,
      setter: ((componentInstance) => (newValue: ((current: T) => T) | T) => {
        if (byCursor[cursor].value !== newValue) {
          byCursor[cursor].value = typeof newValue === 'function'
            ? (newValue as (current: T) => T)(byCursor[cursor].value)
            : newValue;

          if (!componentInstance.forceUpdate) {
            componentInstance.forceUpdate = throttleWithRaf(() => forceUpdateComponent(componentInstance));
          }
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

function useLayoutEffectBase(
  schedulerFn: typeof onTickEnd | typeof requestAnimationFrame,
  effect: () => Function | void,
  dependencies?: any[],
) {
  const { cursor, byCursor } = renderingInstance.hooks.effects;

  const exec = () => {
    const { cleanup } = byCursor[cursor];
    if (typeof cleanup === 'function') {
      cleanup();
    }

    byCursor[cursor].cleanup = effect() as Function;
  };

  if (byCursor[cursor] !== undefined && dependencies && byCursor[cursor].dependencies) {
    if (dependencies.some((dependency, i) => dependency !== byCursor[cursor].dependencies![i])) {
      schedulerFn(exec);
    }
  } else {
    schedulerFn(exec);
  }

  byCursor[cursor] = {
    effect,
    dependencies,
    cleanup: byCursor[cursor] ? byCursor[cursor].cleanup : undefined,
  };

  renderingInstance.hooks.effects.cursor++;
}

export function useEffect(effect: () => Function | void, dependencies?: any[]) {
  return useLayoutEffectBase(fastRaf, effect, dependencies);
}

export function useLayoutEffect(effect: () => Function | void, dependencies?: any[]) {
  return useLayoutEffectBase(onTickEnd, effect, dependencies);
}

export function useMemo<T extends any>(resolver: () => T, dependencies: any[]): T {
  const { cursor, byCursor } = renderingInstance.hooks.memos;
  let { current } = byCursor[cursor] || {};

  if (
    byCursor[cursor] === undefined
    || dependencies.some((dependency, i) => dependency !== byCursor[cursor].dependencies[i])
  ) {
    current = resolver();
  }

  byCursor[cursor] = {
    current,
    dependencies,
  };

  renderingInstance.hooks.memos.cursor++;

  return current;
}

export function useCallback<F extends AnyFunction>(newCallback: F, dependencies: any[]): F {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => newCallback, dependencies);
}

export function useRef<T>(): { current: T | null };
export function useRef<T>(initial: T): { current: T };
export function useRef(initial = null) {
  return useMemo(() => ({
    current: initial,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
}

export function memo<T extends FC>(Component: T, areEqual = arePropsShallowEqual) {
  return function MemoWrapper(props: Props) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const propsRef = useRef(props);
    const renderedRef = useRef();

    if (!renderedRef.current || (propsRef.current && !areEqual(propsRef.current, props))) {
      propsRef.current = props;
      renderedRef.current = createElement(Component, props) as VirtualElementComponent;
    }

    return renderedRef.current;
  } as T;
}

// We need to keep it here for JSX.
export default {
  createElement,
  Fragment,
};
