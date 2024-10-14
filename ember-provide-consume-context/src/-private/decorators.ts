import type ContextRegistry from '../context-registry';
import { EMBER_PROVIDE_CONSUME_CONTEXT_KEY } from './provide-consume-context-container';
import { getContextValue, hasContext } from './utils';

export function provide(contextKey: keyof ContextRegistry) {
  return function decorator(target: any, key: string) {
    // Define a property on the class, which will later be used on instances of
    // the component to register them as context providers.
    const currentContexts = Object.getOwnPropertyDescriptor(
      target,
      EMBER_PROVIDE_CONSUME_CONTEXT_KEY,
    );

    // A class can have multiple @provide decorated properties, we need to
    // merge the definitions
    const contextsValue = {
      ...currentContexts?.value,
      [contextKey]: key,
    };

    Object.defineProperty(target, EMBER_PROVIDE_CONSUME_CONTEXT_KEY, {
      value: contextsValue,
      writable: true,
      configurable: true,
    });
  };
}

export function consume<K extends keyof ContextRegistry>(
  contextKey: K,
): PropertyDecorator {
  return function decorator() {
    return {
      get(): ContextRegistry[K] | undefined {
        if (hasContext(this, contextKey)) {
          return getContextValue(this, contextKey);
        }

        return undefined;
      },
    };
  };
}
