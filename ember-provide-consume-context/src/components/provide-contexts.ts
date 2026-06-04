import Component from '@glimmer/component';
import type Owner from '@ember/owner';
import { provideContextRefs } from '../-private/utils';
import type { ContextRefsInput } from '../-private/provide-consume-context-container';

interface ProvideContextsSignature {
  Args: {
    contextRefs: ContextRefsInput;
  };
  Blocks: {
    default: [];
  };
}

/**
 * Re-provides `ContextRefs` to this component's descendants.
 *
 * This is useful inside a separate root created with `renderComponent`, where
 * DOM ancestry does not automatically carry context across the root boundary.
 */
export default class ProvideContexts extends Component<ProvideContextsSignature> {
  constructor(owner: Owner, args: ProvideContextsSignature['Args']) {
    super(owner, args);

    provideContextRefs(this, args.contextRefs);
  }
}
