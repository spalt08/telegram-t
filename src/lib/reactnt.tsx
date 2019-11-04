import React, { FC, Props, VirtualElementComponent } from './reactt';
import { UpdateAuthorizationStateType } from '../api/tdlib/updates';

const INITIAL_STATE = {
  isInitialized: false,
  isLoggingOut: false,
  authState: '' as UpdateAuthorizationStateType,
  authPhoneNumber: '',
};

export type GlobalState = Partial<typeof INITIAL_STATE>;

type ActionTypes = 'init' | 'setAuthPhoneNumber' | 'setAuthCode';

export type DispatchMap = Record<ActionTypes, Function>;

interface Container {
  component?: VirtualElementComponent;
  ownProps?: Props,
  mappedProps?: Props,
  onGlobalStateUpdate?: Function,
}

type ActionPayload = Record<string, any>;

type Reducer = (
  global: GlobalState,
  dispatchMap: DispatchMap,
  payload?: ActionPayload,
) => GlobalState | void;

let global: GlobalState = INITIAL_STATE;

const reducers: Record<string, Reducer[]> = {};
const callbacks: Function[] = [updateContainers];
const dispatchMap = {} as DispatchMap;
const containers: Container[] = [];

export function setGlobal(newGlobal: GlobalState) {
  if (typeof newGlobal !== 'undefined' && newGlobal !== global) {
    global = newGlobal;
  }

  runCallbacks();
}

export function getGlobal() {
  return global;
}

export function updateGlobal(update: GlobalState) {
  global = {
    ...global,
    ...update,
  };

  runCallbacks();
}

export function getDispatch() {
  return dispatchMap;
}

function onDispatch(name: string, payload?: ActionPayload) {
  if (reducers[name]) {
    reducers[name].forEach((reducer) => {
      const newGlobal = reducer(global, dispatchMap, payload);

      if (typeof newGlobal !== 'undefined' && newGlobal !== global) {
        global = newGlobal;
      }
    });
  }

  runCallbacks();
}

// export function addCallback(cb: Function) {
//   callbacks.push(cb);
// }

function runCallbacks() {
  // TODO throttle
  callbacks.forEach(cb => cb(global));
}

function updateContainers() {
  // TODO throttle
  containers.forEach((c) => c.onGlobalStateUpdate && c.onGlobalStateUpdate(global));
}

export function addReducer(name: ActionTypes, reducer: Reducer) {
  if (!reducers[name]) {
    reducers[name] = [];

    dispatchMap[name] = (payload?: ActionPayload) => {
      onDispatch(name, payload);
    };
  }

  reducers[name].push(reducer);
}

export function withGlobal(
  mapStateToProps: ((global: GlobalState) => GlobalState) = () => ({}),
  mapReducersToProps: ((setGlobal: Function, actions: DispatchMap) => Partial<DispatchMap>) = () => ({}),
) {
  return (Component: FC) => {
    const container: Container = {
      onGlobalStateUpdate: (global: GlobalState) => {
        const newMappedProps = {
          ...mapStateToProps(global),
          ...mapReducersToProps(setGlobal, dispatchMap),
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
          ...mapReducersToProps(setGlobal, dispatchMap),
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
