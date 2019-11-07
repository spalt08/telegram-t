export default (cb: () => void) => {
  Promise.resolve().then(cb);
};
