// import React from 'react';
// export { useState } from 'react';
// export default React;

export type Props = AnyLiteral;
export type FC<P extends Props = any> = (props: P) => VirtualElementComponent;

export enum VirtualElementTypesEnum {
  Tag,
  Component,
}

export const VIRTUAL_ELEMENT_EMPTY = Symbol('VirtualElementEmpty');
export type VirtualElementEmpty = typeof VIRTUAL_ELEMENT_EMPTY;

export type VirtualElementText = string;

export interface VirtualElementTag {
  type: VirtualElementTypesEnum.Tag,
  tag: string,
  props: Props,
  children: VirtualElementChildren,
}

export interface VirtualElementComponent {
  type: VirtualElementTypesEnum.Component,
  componentInstance: ComponentInstance,
  props: Props,
  children: VirtualElementChildren,
}

interface ComponentInstance {
  $element: VirtualElementComponent,
  $prevElement: VirtualElementComponent,
  Component: FC,
  name: string,
  key?: string,
  props: Props,
  children: VirtualElementChildren,
  state: ComponentInstanceState,
  render: () => VirtualElementComponent,
  forceUpdate: Function,
  onUpdate?: Function,
  isUnmounted: boolean,
}

export type VirtualElement = VirtualElementTag | VirtualElementComponent;
export type VirtualElementChild = VirtualElement | VirtualElementEmpty | VirtualElementText;
export type VirtualElementChildren = VirtualElementChild[];
// Fix for default JSX type error.
export type JsxChildren = VirtualElementChildren | VirtualElementChild;

interface ComponentInstanceState {
  cursor: number,
  byCursor: {
    value: any,
    setter: Function
  }[],
}

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
      key: props && props.key ? String(props.key) : undefined,
      name: tag.name,
      props,
      children,
      isUnmounted: false,
      state: {
        cursor: 0,
        byCursor: [],
      },
      render: () => {
        const rendered = renderComponent(componentInstance);

        if (rendered) {
          const children = getUpdatedChildren(componentInstance.$element, [rendered]);
          componentInstance.$prevElement = componentInstance.$element;
          componentInstance.$element = createComponentElement(componentInstance, children);
        }

        return componentInstance.$element;
      },
      forceUpdate: (props?: Props) => {
        if (props) {
          componentInstance.props = props;
        }

        if (componentInstance.onUpdate && !componentInstance.isUnmounted) {
          const currentElement = componentInstance.$element;
          componentInstance.render();

          if (componentInstance.$element !== currentElement) {
            componentInstance.onUpdate(componentInstance.$prevElement, componentInstance.$element);
          }
        }
      },
    };

    componentInstance.$element = createComponentElement(componentInstance);

    return componentInstance.$element;
  }

  const childrenArray = Array.isArray(children[0]) ? children[0] : children;

  return {
    type: VirtualElementTypesEnum.Tag,
    tag,
    props,
    children: childrenArray.map((child): VirtualElementChild => {
      if (isRealElement(child)) {
        return child;
      } else if (child === false || child === null || child === undefined) {
        // Support for `&&` operators.
        return VIRTUAL_ELEMENT_EMPTY;
      } else {
        return String(child);
      }
    }),
  };
}

const createComponentElement = (
  componentInstance: ComponentInstance,
  children: VirtualElementChildren = [],
): VirtualElementComponent => {
  const { props } = componentInstance;

  return {
    componentInstance,
    type: VirtualElementTypesEnum.Component,
    props,
    children,
  };
};

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
      // TODO Remove hooks.
      currentChild.componentInstance.isUnmounted = true;
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
    return $old.tag !== $new.tag;
  } else if (isComponentElement($old) && isComponentElement($new)) {
    // TODO Support keys.
    return $old.componentInstance.Component !== $new.componentInstance.Component;
  }
}

export function useState(initial: any) {
  const { cursor, byCursor } = renderingInstance.state;

  if (typeof byCursor[cursor] === 'undefined') {
    byCursor[cursor] = {
      value: initial,
      setter: ((componentInstance) => (newValue: any) => {
        if (byCursor[cursor].value !== newValue) {
          byCursor[cursor].value = newValue;
          componentInstance.forceUpdate();
        }
      })(renderingInstance),
    };

    renderingInstance.state.cursor++;
  }

  return [
    byCursor[cursor].value,
    byCursor[cursor].setter,
  ];
}

export default {
  createElement,
};

