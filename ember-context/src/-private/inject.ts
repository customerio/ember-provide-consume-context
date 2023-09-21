import { type EmberContext } from './create-context';
import { getContextValue } from './get-context-value';

export function inject<T>(context: EmberContext<T>): PropertyDecorator {
  return function decorator() {
    return {
      get(): T {
        return getContextValue(this, context._id) as T;
      },
    };
  };
}
