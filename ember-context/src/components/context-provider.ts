import Component from '@glimmer/component';
import { trackProviderInstanceContexts } from '../-private/provide-consume-context-container';

interface ContextProviderSignature<T> {
  Args: {
    key: string;
    value: T;
  };
  Blocks: {
    default: [];
  };
}

export default class ContextProvider<T> extends Component<
  ContextProviderSignature<T>
> {
  constructor(owner: unknown, args: ContextProviderSignature<T>['Args']) {
    super(owner, args);

    trackProviderInstanceContexts(this, [[args.key, 'value']]);
  }

  get value() {
    return this.args.value;
  }
}
