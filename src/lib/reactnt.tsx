import React, { FC, Props, VirtualElementComponent } from './reactt';

export interface GlobalState {
  isInitialized: boolean;
}

type DispatchMap = Record<string, Function>;

interface Container {
  component?: VirtualElementComponent;
  ownProps?: Props,
  mappedProps?: Props,
  onGlobalStateUpdate?: Function,
}

const INITIAL_STATE = {
  isInitialized: false,
};

let global: GlobalState = INITIAL_STATE;

const reducers: Record<string, Function> = {};
const dispatch: DispatchMap = {};
const containers: Container[] = [];

export function setGlobal() {
}

export function onDispatch(name: string) {
  if (reducers[name]) {
    global = reducers[name](global);
  }

  // TODO throttle
  containers.forEach((c) => c.onGlobalStateUpdate && c.onGlobalStateUpdate(global));
}

export function addReducer(name: string, reducer: Function) {
  reducers[name] = reducer;
  dispatch[name] = () => {
    onDispatch(name);
  };
}

export function withGlobal(
  mapStateToProps: (global: GlobalState) => Partial<GlobalState>,
  mapReducersToProps: (setGlobal: Function, dispatch: DispatchMap) => Record<string, Function>,
) {
  return (Component: FC) => {
    const container: Container = {
      onGlobalStateUpdate: (global: GlobalState) => {
        const newMappedProps = {
          ...mapStateToProps(global),
          ...mapReducersToProps(setGlobal, dispatch),
        };

        if (
          container.component && (
            !arePropsShallowEqual(container.mappedProps || {}, newMappedProps)
          )) {
          container.mappedProps = newMappedProps;
          container.component.forceUpdate({
            ...container.ownProps,
            ...container.mappedProps,
          });
        }
      },
    };

    containers.push(container);

    return (props: Props) => {
      container.ownProps = props;

      if (!container.mappedProps) {
        container.mappedProps = {
          ...mapStateToProps(global),
          ...mapReducersToProps(setGlobal, dispatch),
        };
      }

      if (!container.component) {
        container.component = <Component {...container.mappedProps} {...props} />;
      }

      return container.component;
    };
  };
}

function arePropsShallowEqual(currentProps: Props, newProps: Props) {
  const currentKeys = Object.keys(currentProps);
  const currentKeysLength = currentKeys.length;
  const newKeysLength = Object.keys(newProps).length;

  if (currentKeysLength !== newKeysLength) {
    return false;
  }

  return currentKeys.every((prop) => currentProps[prop] === newProps[prop]);
}
