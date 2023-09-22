import Component from '@glimmer/component';
import {
  hasContext,
  getContextValue,
  type ContextKey,
} from '../-private/utils';

interface ContextConsumerSignature<T> {
  Args: {
    key: ContextKey<T> | string;
    defaultValue?: T;
  };
  Blocks: {
    default: [T];
  };
}

export default class ContextConsumer<T> extends Component<
  ContextConsumerSignature<T>
> {
  get contextValue() {
    if (hasContext(this, this.args.key)) {
      return getContextValue(this, this.args.key);
    }

    return this.args.defaultValue;
  }
}
