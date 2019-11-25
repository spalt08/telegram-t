function createClasses(params) {
  const classes = {};

  for (const classParams of params) {
    const { name } = classParams;

    class VirtualClass {
      constructor(args) {
        Object.keys(args).forEach((argName) => {
          this[argName] = args[argName];
        });
      }

      getName() {
        return name;
      }

      getArgIndex() {
        return this.index;
      }
    }

    classes[name] = VirtualClass;
  }

  return classes;
}

const classes = createClasses([
  { name: 'A' },
  { name: 'B' },
]);

Object.keys(classes).forEach((className, index) => {
  const instance = new classes[className]({ index });

  console.log('name', instance.getName());
  console.log('arg index', instance.getArgIndex());
});
