// import React from 'react';
// export { useState } from 'react';
// export default React;

import { onNextTick, throttleWithRaf } from '../util/schedulers';
import { flatten } from '../util/iteratees';

export type Props = AnyLiteral;
export type FC<P extends Props = any> = (props: P) => VirtualElementComponent | null;

export enum VirtualElementTypesEnum {
  Tag,
  Component,
}

export const VIRTUAL_ELEMENT_EMPTY = Symbol('VirtualElementEmpty');
export type VirtualElementEmpty = typeof VIRTUAL_ELEMENT_EMPTY;

export type VirtualElementText = string;

export interface VirtualElementTag {
  type: VirtualElementTypesEnum.Tag;
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

export type VirtualElement = VirtualElementTag | VirtualElementComponent;
export type VirtualElementChild = VirtualElement | VirtualElementEmpty | VirtualElementText;
export type VirtualElementChildren = VirtualElementChild[];
// Fix for default JSX type error.
export type JsxChildren = VirtualElementChildren | VirtualElementChild;

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
  }[];
}

interface ComponentInstanceRefs {
  cursor: number;
  byCursor: {
    current: any;
  }[];
}

// Used for memoization.
let renderingInstance: ComponentInstance;

export function isEmptyElement($element: VirtualElementChild): $element is VirtualElementEmpty {
  return $element === VIRTUAL_ELEMENT_EMPTY;
}

export function isTextElement($element: VirtualElementChild): $element is VirtualElementText {
  return typeof $element === 'string';
}

export function isTagElement($element: VirtualElementChild): $element is VirtualElementTag {
  return typeof $element === 'object' && $element.type === VirtualElementTypesEnum.Tag;
}

export function isComponentElement($element: VirtualElementChild): $element is VirtualElementComponent {
  return typeof $element === 'object' && $element.type === VirtualElementTypesEnum.Component;
}

export function isRealElement($element: VirtualElementChild): $element is VirtualElement {
  return isTagElement($element) || isComponentElement($element);
}

function createElement(
  tag: string | FC,
  props: Props,
  ...children: any[]
): VirtualElement {
  if (!props) {
    props = {};
  }

  if (typeof tag === 'function') {
    const componentInstance: ComponentInstance = {
      $element: {} as VirtualElementComponent,
      $prevElement: {} as VirtualElementComponent,
      Component: tag,
      name: tag.name,
      props,
      children: flatten(children),
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
        const rendered = renderComponent(componentInstance);

        if (rendered) {
          const renderedChildren = getUpdatedChildren(componentInstance.$element, [rendered]);
          componentInstance.$prevElement = componentInstance.$element;
          componentInstance.$element = createComponentElement(componentInstance, renderedChildren);
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
    children: flatten(children).map((child: any): VirtualElementChild => {
      if (child === false || child === null || child === undefined) {
        // Support for `&&` operators.
        return VIRTUAL_ELEMENT_EMPTY;
      } else if (isRealElement(child)) {
        return child;
      } else {
        return String(child);
      }
    }),
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

function getUpdatedChildren($element: VirtualElement, newChildren: VirtualElementChildren) {
  const currentLength = $element.children.length;
  const newLength = newChildren.length;
  const maxLength = Math.max(currentLength, newLength);

  const children: VirtualElementChildren = [];
  for (let i = 0; i < maxLength; i++) {
    children.push(getUpdatedChild($element, i, $element.children[i], newChildren[i]) || VIRTUAL_ELEMENT_EMPTY);
  }
  return children;
}

function getUpdatedChild(
  $element: VirtualElement,
  childIndex: number,
  currentChild: VirtualElementChild,
  newChild: VirtualElementChild,
) {
  if (isRealElement(currentChild) && isRealElement(newChild) && !hasElementChanged(currentChild, newChild)) {
    if (isComponentElement(currentChild) && isComponentElement(newChild)) {
      currentChild.componentInstance.props = newChild.componentInstance.props;
      // TODO Support new children
      return currentChild.componentInstance.render();
    } else {
      newChild.children = getUpdatedChildren(currentChild, newChild.children);
    }
  } else {
    if (isComponentElement(currentChild)) {
      unmountComponent(currentChild.componentInstance);
    }

    if (isComponentElement(newChild)) {
      return newChild.componentInstance.render();
    }
  }

  return newChild;
}

export function hasElementChanged($old: VirtualElementChild, $new: VirtualElementChild) {
  if (typeof $old !== typeof $new) {
    return true;
  } else if (!isRealElement($old) || !isRealElement($new)) {
    return $old !== $new;
  } else if ($old.type !== $new.type) {
    return true;
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

function unmountComponent(componentInstance: ComponentInstance) {
  // TODO Remove hooks.
  componentInstance.isUnmounted = true;
  componentInstance.$element.children.forEach((child) => {
    if (isComponentElement(child)) {
      unmountComponent(child.componentInstance);
    }
  });
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

// TODO Support cleanup.
export function useEffect(effect: () => void, dependencies?: any[]) {
  const { cursor, byCursor } = renderingInstance.effects;

  if (byCursor[cursor] !== undefined && dependencies && byCursor[cursor].dependencies) {
    if (dependencies.some((dependency, i) => dependency !== byCursor[cursor].dependencies![i])) {
      onNextTick(effect);
    }
  } else {
    onNextTick(effect);
  }

  byCursor[cursor] = {
    effect,
    dependencies,
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

// TODO Not working, breaks DOM rendering, debug and fix needed.
// TODO Support `areEqual` argument.
// export function memo(Component: FC): FC {
//   return function memoWrapper(props: Props) {
//     const propsRef = useRef({});
//
//     if (arePropsShallowEqual(propsRef.current, props)) {
//       return null;
//     }
//
//     propsRef.current = props;
//
//     return createElement(Component, props) as VirtualElementComponent;
//   };
// }

// We need to keep it here for JSX.
export default {
  createElement,
};
