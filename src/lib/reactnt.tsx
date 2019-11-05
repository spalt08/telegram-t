// TODO default?
// import React, { getGlobal, setGlobal } from 'reactn';
// export { addReducer, getGlobal, setGlobal, withGlobal, useGlobal } from 'reactn';

import { UpdateAuthorizationStateType } from '../api/tdlib/updates';
import useForceUpdate from '../hooks/useForceUpdate';
import generateIdFor from '../util/generateIdFor';
import throttleWithRaf from '../util/throttleWithRaf';

export default React;

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

type ActionTypes = 'init' | 'setAuthPhoneNumber' | 'setAuthCode' | 'loadChats' | 'signOut';

export type DispatchMap = Record<ActionTypes, Function>;

// TODO Replace with nested reducers
export function updateGlobal(update: GlobalState) {
  setGlobal({
    ...getGlobal(),
    ...update,
  });
}

/* Polyfill start */
import React, { FC, Props, useState } from './reactt';

type ActionPayload = Record<string, any>;

type Reducer = (
  global: GlobalState,
  actions: DispatchMap,
  payload?: ActionPayload,
) => GlobalState | void;

type MapStateToProps = ((global: GlobalState, ownProps?: any) => Record<string, any>);
type MapActionsToProps = ((setGlobal: Function, actions: DispatchMap) => Partial<DispatchMap>);

let global: GlobalState = INITIAL_STATE;

const reducers: Record<string, Reducer[]> = {};
const callbacks: Function[] = [updateContainers];
const actions = {} as DispatchMap;
const containers: Record<string, {
  mapStateToProps: MapStateToProps,
  mapReducersToProps: MapActionsToProps,
  ownProps: Props;
  mappedProps: Props;
  forceUpdate: Function;
}> = {};

export function setGlobal(newGlobal: GlobalState) {
  if (typeof newGlobal !== 'undefined' && newGlobal !== global) {
    global = newGlobal;
  }

  runCallbacksThrottled();
}

export function getGlobal() {
  return global;
}

export function getDispatch() {
  return actions;
}

function onDispatch(name: string, payload?: ActionPayload) {
  if (reducers[name]) {
    reducers[name].forEach((reducer) => {
      const newGlobal = reducer(global, actions, payload);

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
  Object.keys(containers).forEach(id => {
    const { mapStateToProps, mapReducersToProps, ownProps, mappedProps, forceUpdate } = containers[id];
    const newMappedProps = {
      ...mapStateToProps(global, ownProps),
      ...mapReducersToProps(setGlobal, actions),
    };

    if (!arePropsShallowEqual(mappedProps, newMappedProps)) {
      containers[id].mappedProps = newMappedProps;
      forceUpdate();
    }
  });
}

export function addReducer(name: ActionTypes, reducer: Reducer) {
  if (!reducers[name]) {
    reducers[name] = [];

    actions[name] = (payload?: ActionPayload) => {
      onDispatch(name, payload);
    };
  }

  reducers[name].push(reducer);
}

export function withGlobal(
  mapStateToProps: MapStateToProps = () => ({}),
  mapReducersToProps: MapActionsToProps = () => ({}),
) {
  return (Component: FC) => {
    return function Container(props: Props) {
      const [id] = useState(generateIdFor(containers));
      const forceUpdate = useForceUpdate();

      // TODO Support unmount.
      if (!containers[id]) {
        containers[id] = {
          mapStateToProps,
          mapReducersToProps,
          ownProps: props,
          mappedProps: {
            ...mapStateToProps(global, props),
            ...mapReducersToProps(setGlobal, actions),
          },
          forceUpdate,
        };
      }

      containers[id].ownProps = props;

      return <Component {...containers[id].mappedProps} {...props} />;
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
