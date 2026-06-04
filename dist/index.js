import { E as EMBER_PROVIDE_CONSUME_CONTEXT_KEY } from './provide-consume-context-container-cc507b9e.js';
export { C as ContextRef, c as ContextRefs } from './provide-consume-context-container-cc507b9e.js';
import { g as getContextValue } from './utils-7f6231f0.js';
export { a as getAllContextRefs, b as getContextRef, c as getContextRefs, h as hasContext, p as provideContextRefs } from './utils-7f6231f0.js';

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
        return getContextValue(this, contextKey);
      }
    };
  };
}

export { consume, getContextValue as getContext, provide };
//# sourceMappingURL=index.js.map
