import { getContextValue, hasContext, type ContextKey } from './utils';

export function inject<T>(
  contextKey: ContextKey<T> | string,
  defaultValue?: T,
): PropertyDecorator {
  return function decorator() {
    return {
      get() {
        if (hasContext(this, contextKey)) {
          return getContextValue(this, contextKey);
        }

        return defaultValue;
      },
    };
  };
}
