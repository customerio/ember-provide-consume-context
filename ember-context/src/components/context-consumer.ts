import Component from '@glimmer/component';
import { hasContext, getContextValue } from '../-private/utils';
import type ContextRegistry from '../context-registry';

interface ContextConsumerSignature<T extends keyof ContextRegistry> {
  Args: {
    key: T;
    defaultValue?: ContextRegistry[T];
  };
  Blocks: {
    default: [ContextRegistry[T] | null];
  };
}

export default class ContextConsumer<
  T extends keyof ContextRegistry,
> extends Component<ContextConsumerSignature<T>> {
  get contextValue(): ContextRegistry[T] | null {
    if (hasContext(this, this.args.key)) {
      return getContextValue(this, this.args.key);
    }

    return this.args.defaultValue ?? null;
  }
}
