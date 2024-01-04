import { D as DECORATED_PROPERTY_CLASSES } from './provide-consume-context-container-a9f92938.js';
import { h as hasContext, g as getContextValue } from './utils-10402092.js';

function provide(contextKey) {
  return function decorator(target, key) {
    // Track the class as having a decorated property. Later, this will be used
    // on instances of this component to register them as context providers.
    const currentContexts = DECORATED_PROPERTY_CLASSES.get(target.constructor);
    if (currentContexts == null) {
      DECORATED_PROPERTY_CLASSES.set(target.constructor, {
        [contextKey]: key
      });
    } else {
      DECORATED_PROPERTY_CLASSES.set(target.constructor, {
        ...currentContexts,
        [contextKey]: key
      });
    }
  };
}
function consume(contextKey) {
  return function decorator() {
    return {
      get() {
        if (hasContext(this, contextKey)) {
          return getContextValue(this, contextKey);
        }
        return null;
      }
    };
  };
}

export { consume, provide };
//# sourceMappingURL=index.js.map
