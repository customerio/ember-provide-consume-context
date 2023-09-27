import type ContextRegistry from '../context-registry';
import { DECORATED_PROPERTY_CLASSES } from './provide-consume-context-container';
import { getContextValue, hasContext } from './utils';

export function provide(contextKey: keyof ContextRegistry) {
  return function decorator(target: any, key: string) {
    // Track the class as having a decorated property. Later, this will be used
    // on instances of this component to register them as context providers.
    const currentContexts = DECORATED_PROPERTY_CLASSES.get(target.constructor);
    if (currentContexts == null) {
      DECORATED_PROPERTY_CLASSES.set(target.constructor, {
        [contextKey]: key,
      });
    } else {
      DECORATED_PROPERTY_CLASSES.set(target.constructor, {
        ...currentContexts,
        [contextKey]: key,
      });
    }
  };
}

export function consume<K extends keyof ContextRegistry>(
  contextKey: K,
): PropertyDecorator {
  return function decorator() {
    return {
      get(): ContextRegistry[K] | null | undefined {
        if (hasContext(this, contextKey)) {
          return getContextValue(this, contextKey);
        }

        return null;
      },
    };
  };
}
