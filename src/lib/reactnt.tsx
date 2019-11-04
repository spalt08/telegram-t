import React, { FC, Props, VirtualElementComponent } from './reactt';
import { UpdateAuthorizationStateType } from '../api/tdlib/updates';
import throttleWithRaf from '../util/throttleWithRaf';

export type GlobalState = Partial<{
  isInitialized: boolean,
  isLoggingOut: boolean,
  authState: UpdateAuthorizationStateType,
  authPhoneNumber: string,
  chats: {
    byId: Record<string, any>,
  },
}>;

const INITIAL_STATE: GlobalState = {
  isInitialized: false,
  isLoggingOut: false,
};

type ActionTypes = 'init' | 'setAuthPhoneNumber' | 'setAuthCode' | 'loadChats';

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

  runCallbacksThrottled();
}

export function getGlobal() {
  return global;
}

export function updateGlobal(update: GlobalState) {
  global = {
    ...global,
    ...update,
  };

  runCallbacksThrottled();
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

  runCallbacksThrottled();
}

// export function addCallback(cb: Function) {
//   callbacks.push(cb);
// }

function runCallbacks() {
  callbacks.forEach(cb => cb(global));
}

const runCallbacksThrottled = throttleWithRaf(runCallbacks);

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
  mapStateToProps: ((global: GlobalState, ownProps?: any) => Record<string, any>) = () => ({}),
  mapReducersToProps: ((setGlobal: Function, actions: DispatchMap) => Partial<DispatchMap>) = () => ({}),
) {
  return (Component: FC) => {
    return (props: Props) => {
      const container: Container = {
        onGlobalStateUpdate: (global: GlobalState) => {
          if (!container.component) {
            return;
          }

          const newMappedProps = {
            ...mapStateToProps(global, container.ownProps),
            ...mapReducersToProps(setGlobal, dispatchMap),
          };

          if (container.mappedProps && !arePropsShallowEqual(container.mappedProps, newMappedProps)) {
            container.mappedProps = newMappedProps;
            container.component.forceUpdate({
              ...container.ownProps,
              ...container.mappedProps,
            });
          }
        },
        ownProps: props,
      };

      containers.push(container);

      if (!container.mappedProps) {
        container.mappedProps = {
          ...mapStateToProps(global, props),
          ...mapReducersToProps(setGlobal, dispatchMap),
        };
      }

      // TODO Refactor.
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
