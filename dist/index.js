import { E as EMBER_PROVIDE_CONSUME_CONTEXT_KEY } from './provide-consume-context-container-246f3ea2.js';
import { h as hasContext, g as getContextValue } from './utils-10402092.js';

function provide(contextKey) {
  return function decorator(target, key) {
    // Define a property on the class, which will later be used on instances of
    // the component to register them as context providers.
    const currentContexts = Object.getOwnPropertyDescriptor(target, EMBER_PROVIDE_CONSUME_CONTEXT_KEY);

    // A class can have multiple @provide decorated properties, we need to
    // merge the definitions
    const contextsValue = {
      ...currentContexts?.value,
      [contextKey]: key
    };
    Object.defineProperty(target, EMBER_PROVIDE_CONSUME_CONTEXT_KEY, {
      value: contextsValue,
      writable: true,
      configurable: true
    });
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
