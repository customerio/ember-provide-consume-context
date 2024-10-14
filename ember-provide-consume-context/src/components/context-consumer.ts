import Component from '@glimmer/component';
import { hasContext, getContextValue } from '../-private/utils';
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
    if (hasContext(this, this.args.key)) {
      return getContextValue(this, this.args.key);
    }

    return this.args.defaultValue;
  }
}
