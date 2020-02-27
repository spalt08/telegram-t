import { flatten } from './iteratees';

type Parts = (string | string[] | false | undefined)[];

export default (...parts: Parts) => {
  return flatten(parts.filter(Boolean)).join(' ');
};
