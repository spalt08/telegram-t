// import React from 'react';

const DEFAULT_TAG = 'div';
let $renderingComponent: VirtualElementComponent;

export enum VirtualElementTypesEnum {
  Tag,
  Component,
}

export interface VirtualElementTag {
  type: VirtualElementTypesEnum.Tag,
  tag: string,
  props: Record<string, any>,
  children: VirtualElementChildren,
}

interface State {
  cursor: number,
  store: {
    value: any,
    setter: Function
  }[],
}

export interface VirtualElementComponent extends Omit<VirtualElementTag, 'type'> {
  type: VirtualElementTypesEnum.Component,
  name: string,
  state: State,
  forceUpdate: Function,
  onUpdate?: Function,
}

export type VirtualElement = VirtualElementTag | VirtualElementComponent;
export type VirtualElementChild = string | VirtualElementTag | VirtualElementComponent;
type VirtualElementChildOrEmpty = VirtualElementChild | undefined;
export type VirtualElementChildren = VirtualElementChildOrEmpty[];
// Fix for default JSX type error.
export type JsxChildren = VirtualElementChildren | VirtualElementChild;

export function isStringElement(object: VirtualElementChildOrEmpty): object is string {
  return typeof object === 'string';
}

export function isTagElement(object: VirtualElementChildOrEmpty): object is VirtualElementTag {
  return typeof object === 'object' && object.type === VirtualElementTypesEnum.Tag;
}

export function isComponentElement(object: VirtualElementChildOrEmpty): object is VirtualElementComponent {
  return typeof object === 'object' && object.type === VirtualElementTypesEnum.Component;
}

function createElement(
  tag: string | Function = DEFAULT_TAG,
  props: Record<string, any>,
  ...children: any[]
): VirtualElement {
  if (typeof tag === 'function') {
    const $element: VirtualElementComponent = {
      type: VirtualElementTypesEnum.Component,
      tag: DEFAULT_TAG, // TODO Try to remove.
      name: tag.name,
      props: props !== null ? props : {},
      children: [],
      state: {
        cursor: 0,
        store: [],
      },
      forceUpdate: () => {
        if ($element.onUpdate) {
          $element.onUpdate({
            ...$element,
            children: [renderComponent($element, tag, children)],
          });
        }
      },
    };

    $element.children = [renderComponent($element, tag, children)];

    return $element;
  }

  const childrenArray = Array.isArray(children[0]) ? children[0] : children;

  return {
    type: VirtualElementTypesEnum.Tag,
    tag,
    props: props !== null ? props : {},
    children: childrenArray.map((child): VirtualElementChild | undefined => {
      if (typeof child === 'object') {
        return child;
      } else if (child === false) {
        // Support for `&&` operator.
        return undefined;
      } else {
        return String(child);
      }
    }),
  };
}

function renderComponent($element: VirtualElementComponent, tag: Function, children: VirtualElementChildren) {
  $renderingComponent = $element;
  $renderingComponent.state.cursor = 0;

  return tag({
    ...$element.props,
    children,
  });
}

export function useState(initial: any) {
  const { cursor, store } = $renderingComponent.state;

  if (typeof store[cursor] === 'undefined') {
    store[cursor] = {
      value: initial,
      setter: (($component) => (newValue: any) => {
        if (store[cursor].value !== newValue) {
          store[cursor].value = newValue;
          $component.forceUpdate();
        }
      })($renderingComponent),
    };
  }

  return [
    store[cursor].value,
    store[cursor].setter,
  ];
}

export default {
  createElement,
};
//
// export default React;

