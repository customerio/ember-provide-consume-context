import {
  PROVIDED_PROPS,
  PROVIDER_CLASSES,
} from './provide-consume-context-container';

export function provide(contextKey: string) {
  return function decorator(
    target: any,
    key: string,
    descriptor: PropertyDescriptor,
  ) {
    if (PROVIDER_CLASSES.get(target.constructor) == null) {
      PROVIDER_CLASSES.set(target.constructor, {
        [contextKey]: key,
      });
    } else {
      const providerClasses = PROVIDER_CLASSES.get(target.constructor);
      providerClasses[contextKey] = key;
      PROVIDER_CLASSES.set(target.constructor, providerClasses);
    }

    return descriptor;

    // function getter(this: any) {
    // return currentValue;
    // }

    // function setter(value: any) {
    // currentValue = value;
    // }

    // if (descriptor != null) {
    // descriptor.get = getter;
    // descriptor.set = setter;
    // return descriptor;
    // }
  };
}
