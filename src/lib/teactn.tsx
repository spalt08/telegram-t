// TODO default?
// import React, { getGlobal, setGlobal } from 'reactn';
// export { addReducer, getGlobal, setGlobal, withGlobal, useGlobal } from 'reactn';

import {
  UpdateAuthorizationStateType, ApiUser, ApiChat, ApiMessage,
} from '../api/tdlib/types';
import useForceUpdate from '../hooks/useForceUpdate';
import generateIdFor from '../util/generateIdFor';
import { throttleWithRaf } from '../util/schedulers';

/* Polyfill start */
import React, { FC, Props, useState } from './teact';
import { DEBUG } from '../config';
import { orderBy } from '../util/iteratees';

export default React;

export type GlobalState = {
  isInitialized: boolean;

  users: {
    byId: Record<number, ApiUser>;
  };

  chats: {
    selectedId?: number;
    ids: number[];
    byId: Record<number, ApiChat>;
    scrollOffsetById: Record<number, number>;
  };

  messages: {
    selectedId?: number;
    byChatId: Record<number, {
      byId: Record<number, ApiMessage>;
    }>;
  };

  // TODO Move to `auth`.
  isLoggingOut?: boolean;
  authState?: UpdateAuthorizationStateType;
  authPhoneNumber?: string;
  authError?: string;
};

const INITIAL_STATE: GlobalState = {
  isInitialized: false,

  users: {
    byId: {},
  },

  chats: {
    ids: [],
    byId: {},
    scrollOffsetById: {},
  },

  messages: {
    byChatId: {},
  },
};

type ActionTypes = (
  // system
  'init' | 'setAuthPhoneNumber' | 'setAuthCode' | 'setAuthPassword' | 'signUp' | 'returnToAuthPhoneNumber' | 'signOut' |
  // chats
  'loadChats' | 'loadMoreChats' | 'selectChat' | 'setChatScrollOffset' |
  // messages
  'loadChatMessages' | 'loadMoreChatMessages' | 'selectMessage' | 'sendTextMessage'
);

export type DispatchMap = Record<ActionTypes, Function>;

type ActionPayload = AnyLiteral;

type Reducer = (
  global: GlobalState,
  actions: DispatchMap,
  payload?: ActionPayload,
) => GlobalState | void;

type MapStateToProps = ((global: GlobalState, ownProps?: any) => AnyLiteral | null);
type MapActionsToProps = ((setGlobal: Function, actions: DispatchMap) => Partial<DispatchMap> | null);

let global = INITIAL_STATE;
// TODO Remove before release.
(window as any).getGlobal = getGlobal;

const reducers: Record<string, Reducer[]> = {};
const callbacks: Function[] = [updateContainers];
const actions = {} as DispatchMap;
const containers: Record<string, {
  mapStateToProps: MapStateToProps;
  mapReducersToProps: MapActionsToProps;
  ownProps: Props;
  mappedProps: Props;
  forceUpdate: Function;
  areMappedPropsChanged: boolean;
  DEBUG_updates: number;
  DEBUG_componentName: string;
}> = {};

function runCallbacks() {
  callbacks.forEach((cb) => cb(global));
}

const runCallbacksThrottled = throttleWithRaf(runCallbacks);

export function setGlobal(newGlobal?: GlobalState) {
  if (typeof newGlobal === 'object' && newGlobal !== global) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[State] UPDATE', { global, newGlobal });
    }

    global = newGlobal;
    runCallbacksThrottled();
  }
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
      if (newGlobal) {
        setGlobal(newGlobal);
      }
    });
  }
}

function updateContainers() {
  Object.keys(containers).forEach((id) => {
    const {
      mapStateToProps, mapReducersToProps, ownProps, mappedProps, forceUpdate,
    } = containers[id];
    const newMappedProps = {
      ...mapStateToProps(global, ownProps),
      ...mapReducersToProps(setGlobal, actions),
    };

    if (Object.keys(newMappedProps).length && !arePropsShallowEqual(mappedProps, newMappedProps)) {
      containers[id].mappedProps = newMappedProps;
      containers[id].areMappedPropsChanged = true;
      containers[id].DEBUG_updates++;

      forceUpdate();
    }
  });
}

export function addReducer(name: ActionTypes, reducer: Reducer) {
  if (!reducers[name]) {
    reducers[name] = [];

    actions[name] = (payload?: ActionPayload) => {
      if (DEBUG) {
        // eslint-disable-next-line no-console
        console.log('[State] ACTION', name, payload);
      }

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
          mappedProps: {},
          areMappedPropsChanged: false,
          forceUpdate,
          DEBUG_updates: 0,
          DEBUG_componentName: Component.name,
        };
      }

      if (containers[id].areMappedPropsChanged) {
        containers[id].areMappedPropsChanged = false;
      } else {
        containers[id].ownProps = props;
        containers[id].mappedProps = {
          ...mapStateToProps(global, props),
          ...mapReducersToProps(setGlobal, actions),
        };
      }
      // eslint-disable-next-line react/jsx-props-no-spreading
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

document.addEventListener('dblclick', () => {
  // eslint-disable-next-line no-console
  console.log('GLOBAL CONTAINERS', orderBy(Object.values(containers), 'DEBUG_updates'));
});
