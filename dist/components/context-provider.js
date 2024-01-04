import Component from '@glimmer/component';
import { t as trackProviderInstanceContexts } from '../provide-consume-context-container-a9f92938.js';

class ContextProvider extends Component {
  constructor(owner, args) {
    super(owner, args);
    trackProviderInstanceContexts(this, [[args.key, 'value']]);
  }
  get value() {
    return this.args.value;
  }
}

export { ContextProvider as default };
//# sourceMappingURL=context-provider.js.map
