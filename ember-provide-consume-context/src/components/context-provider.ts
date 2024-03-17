import Component from '@glimmer/component';
import { setContextMetadataOnContextProviderInstance } from '../-private/provide-consume-context-container';
import type ContextRegistry from '../context-registry';

interface ContextProviderSignature<K extends keyof ContextRegistry> {
  Args: {
    key: K;
    value: ContextRegistry[K];
  };
  Blocks: {
    default: [];
  };
}

export default class ContextProvider<
  K extends keyof ContextRegistry,
> extends Component<ContextProviderSignature<K>> {
  constructor(owner: unknown, args: ContextProviderSignature<K>['Args']) {
    super(owner, args);

    setContextMetadataOnContextProviderInstance(this, [[args.key, 'value']]);
  }

  get value() {
    return this.args.value;
  }
}
