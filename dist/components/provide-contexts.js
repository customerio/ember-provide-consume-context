import Component from '@glimmer/component';
import { p as provideContextRefs } from '../utils-7f6231f0.js';

/**
 * Re-provides `ContextRefs` to this component's descendants.
 *
 * This is useful inside a separate root created with `renderComponent`, where
 * DOM ancestry does not automatically carry context across the root boundary.
 */
class ProvideContexts extends Component {
  constructor(owner, args) {
    super(owner, args);
    provideContextRefs(this, args.contextRefs);
  }
}

export { ProvideContexts as default };
//# sourceMappingURL=provide-contexts.js.map
