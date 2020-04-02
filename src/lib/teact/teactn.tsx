import React, {
  FC, Props, useEffect, useState,
} from './teact';

import useForceUpdate from '../../hooks/useForceUpdate';
import generateIdFor from '../../util/generateIdFor';
import { throttleWithRaf } from '../../util/schedulers';
import arePropsShallowEqual from '../../util/arePropsShallowEqual';
import { orderBy } from '../../util/iteratees';
import { GlobalState, GlobalActions, ActionTypes } from '../../global/types';

export default React;

type ActionPayload = AnyLiteral;

type Reducer = (
  global: GlobalState,
  actions: GlobalActions,
  payload?: ActionPayload,
) => GlobalState | void;

type MapStateToProps<OwnProps = undefined> = ((global: GlobalState, ownProps: OwnProps) => AnyLiteral | null);
type MapActionsToProps = ((setGlobal: Function, actions: GlobalActions) => Partial<GlobalActions> | null);

let global = {} as GlobalState;

// TODO Remove before release.
(window as any).getGlobal = getGlobal;

const reducers: Record<string, Reducer[]> = {};
const callbacks: Function[] = [updateContainers];
const actions = {} as GlobalActions;
const containers: Record<string, {
  mapStateToProps: MapStateToProps<any>;
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
      onDispatch(name, payload);
    };
  }

  reducers[name].push(reducer);
}

export function addCallback(cb: Function) {
  callbacks.push(cb);
}

export function removeCallback(cb: Function) {
  const index = callbacks.indexOf(cb);
  if (index !== -1) {
    delete callbacks[index];
  }
}

export function withGlobal<OwnProps = Props>(
  mapStateToProps: MapStateToProps<OwnProps> = () => ({}),
  mapReducersToProps: MapActionsToProps = () => ({}),
) {
  return (Component: FC) => {
    return function Container(props: OwnProps) {
      const [id] = useState(generateIdFor(containers));
      const forceUpdate = useForceUpdate();
      useEffect(() => {
        return () => {
          delete containers[id];
        };
      }, [id]);

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

document.addEventListener('dblclick', () => {
  // eslint-disable-next-line no-console
  console.log('GLOBAL CONTAINERS', orderBy(Object.values(containers), 'DEBUG_updates'));
});
