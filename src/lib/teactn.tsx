// TODO default?
// import React, { getGlobal, setGlobal } from 'reactn';
// export { addReducer, getGlobal, setGlobal, withGlobal, useGlobal } from 'reactn';

import { UpdateAuthorizationStateType } from '../api/tdlib/updates';
import useForceUpdate from '../hooks/useForceUpdate';
import generateIdFor from '../util/generateIdFor';
import throttleWithRaf from '../util/throttleWithRaf';

export default React;

export type GlobalState = {
  isInitialized: boolean,

  chats: {
    selectedId?: number;
    ids: number[],
    byId: Record<string, ApiChat>,
  },

  messages: {
    selectedId?: number;
    byChatId: Record<string, ApiMessage[]>,
  },

  // TODO Move to `auth`.
  isLoggingOut?: boolean,
  authState?: UpdateAuthorizationStateType,
  authPhoneNumber?: string,
};

const INITIAL_STATE: GlobalState = {
  isInitialized: false,

  chats: {
    ids: [],
    byId: {},
  },

  messages: {
    byChatId: {}
  }
};

type ActionTypes = (
  // system
  'init' | 'setAuthPhoneNumber' | 'setAuthCode' | 'signOut' |
  // chats
  'loadChats' | 'selectChat' |
  // messages
  'loadChatMessages' | 'selectMessage' | 'sendTextMessage'
  );

export type DispatchMap = Record<ActionTypes, Function>;

/* Polyfill start */
import React, { FC, Props, useState } from './teact';
import { ApiMessage } from '../modules/tdlib/types/messages';
import { ApiChat } from '../modules/tdlib/types/chats';

type ActionPayload = AnyLiteral;

type Reducer = (
  global: GlobalState,
  actions: DispatchMap,
  payload?: ActionPayload,
) => GlobalState | void;

type MapStateToProps = ((global: GlobalState, ownProps?: any) => AnyLiteral);
type MapActionsToProps = ((setGlobal: Function, actions: DispatchMap) => Partial<DispatchMap>);

let global = INITIAL_STATE;

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
  console.log('[State] UPDATE', { global, newGlobal });

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
      console.log('[State] ACTION', name, payload);

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
