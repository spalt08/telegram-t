/* eslint-disable no-underscore-dangle */

const TRANSITION_DEFAULT_DURATION = 300;

function transition(t) {
  return 1 - (1 - t) ** 1.675;
}

export function createTransitionManager(onTick) {
  const _transitions = {};

  let _nextFrame = null;

  function add({
    prop,
    from = 0,
    to = 1,
    duration = TRANSITION_DEFAULT_DURATION,
    context = {},
  }) {
    _transitions[prop] = {
      from,
      to,
      duration,
      context,
      current: from,
      startedAt: Date.now(),
      progress: 0,
    };

    if (!_nextFrame) {
      _nextFrame = requestAnimationFrame(_tick);
    }
  }

  function remove(prop) {
    delete _transitions[prop];

    if (!isRunning()) {
      cancelAnimationFrame(_nextFrame);
      _nextFrame = null;
    }
  }

  function get(prop) {
    return _transitions[prop];
  }

  function isRunning() {
    return Boolean(Object.keys(_transitions).length);
  }

  function _tick() {
    Object.keys(_transitions)
      .forEach((prop) => {
        const {
          startedAt, from, to, duration,
        } = _transitions[prop];
        const progress = Math.min(1, (Date.now() - startedAt) / duration);

        _transitions[prop].current = from + (to - from) * transition(progress);
        _transitions[prop].progress = progress;

        if (progress === 1) {
          remove(prop);
        }
      });

    onTick(_transitions);

    if (isRunning()) {
      _nextFrame = requestAnimationFrame(_tick);
    }
  }

  return {
    add,
    remove,
    get,
  };
}
