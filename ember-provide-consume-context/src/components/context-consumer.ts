import Component from '@glimmer/component';
import { getContextValue } from '../-private/utils';
import type ContextRegistry from '../context-registry';

interface ContextConsumerSignature<K extends keyof ContextRegistry> {
  Args: {
    key: K;
    defaultValue?: ContextRegistry[K];
  };
  Blocks: {
    default: [ContextRegistry[K] | undefined];
  };
}

export default class ContextConsumer<
  K extends keyof ContextRegistry,
> extends Component<ContextConsumerSignature<K>> {
  get contextValue(): ContextRegistry[K] | undefined {
    const result = getContextValue(this, this.args.key);

    if (result === undefined) {
      return this.args.defaultValue;
    }

    return result;
  }
}
