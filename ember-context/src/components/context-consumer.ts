import Component from '@glimmer/component';
import { hasContext, getContextValue } from '../-private/utils';

interface ContextConsumerSignature<T> {
  Args: {
    key: string;
    defaultValue?: T;
  };
  Blocks: {
    default: [T | null];
  };
}

export default class ContextConsumer<T> extends Component<
  ContextConsumerSignature<T>
> {
  get contextValue(): T | null {
    if (hasContext(this, this.args.key)) {
      return getContextValue(this, this.args.key);
    }

    return this.args.defaultValue ?? null;
  }
}
