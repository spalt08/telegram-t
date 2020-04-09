import { useEffect, useState } from '../lib/teact/teact';

import {
  BundleModules, Bundles, getModuleFromMemory, loadModule,
} from '../util/moduleLoader';

export default <B extends Bundles, M extends BundleModules<B>>(bundleName: B, moduleName: M, noLoad = false) => {
  const module = getModuleFromMemory(bundleName, moduleName);
  const [, onLoad] = useState(null);

  useEffect(() => {
    if (!noLoad && !module) {
      loadModule(bundleName, moduleName).then(onLoad);
    }
  }, [bundleName, module, moduleName, noLoad]);

  return module;
};
