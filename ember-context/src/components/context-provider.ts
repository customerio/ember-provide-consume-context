import Component from '@glimmer/component';
import type { ContextKey } from '../-private/utils';

interface ContextProviderSignature<T, K = ContextKey<T> | string> {
  Args: {
    key: K;
    value: K extends ContextKey<infer V> ? V : T;
  };
  Blocks: {
    default: [];
  };
}

export default class ContextProvider<T, K> extends Component<
  ContextProviderSignature<T, K>
> {
  get key() {
    return this.args.key;
  }
  get value() {
    return this.args.value;
  }
}
