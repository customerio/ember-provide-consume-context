import { type EmberContext } from './create-context';
import { getContextValue, hasContext } from './utils';

export function inject<T>(context: EmberContext<T>): PropertyDecorator {
  return function decorator() {
    return {
      get() {
        if (hasContext(this, context._id)) {
          return getContextValue(this, context._id);
        }

        return context._defaultValue;
      },
    };
  };
}
