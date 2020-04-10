import { useEffect, useState } from '../lib/teact/teact';

import {
  BundleModules, Bundles, getModuleFromMemory, loadModule,
} from '../util/moduleLoader';

export default <B extends Bundles, M extends BundleModules<B>>(bundleName: B, moduleName: M, noLoad = false) => {
  const module = getModuleFromMemory(bundleName, moduleName);
  const [, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!noLoad && !module) {
      loadModule(bundleName, moduleName).then(() => setIsLoaded(true));
    }
  }, [bundleName, module, moduleName, noLoad]);

  return module;
};
