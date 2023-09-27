import Component from '@glimmer/component';
import { trackProviderInstanceContexts } from '../-private/provide-consume-context-container';
import type ContextRegistry from '../context-registry';

interface ContextProviderSignature<T extends keyof ContextRegistry> {
  Args: {
    key: T;
    value: ContextRegistry[T];
  };
  Blocks: {
    default: [];
  };
}

export default class ContextProvider<
  T extends keyof ContextRegistry,
> extends Component<ContextProviderSignature<T>> {
  constructor(owner: unknown, args: ContextProviderSignature<T>['Args']) {
    super(owner, args);

    trackProviderInstanceContexts(this, [[args.key, 'value']]);
  }

  get value() {
    return this.args.value;
  }
}
