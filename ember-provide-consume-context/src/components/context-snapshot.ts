import Component from '@glimmer/component';
import type Owner from '@ember/owner';
import { getAllContextRefs } from '../-private/utils';

interface ContextSnapshotSignature {
  Args: Record<string, never>;
  Blocks: {
    default: [ReturnType<typeof getAllContextRefs>];
  };
}

/**
 * Yields a snapshot of all contexts visible at this point in the component tree.
 *
 * Pass the yielded value to `<ProvideContexts>` or `provideContextRefs()` to
 * bridge context into a separately rendered component root.
 */
export default class ContextSnapshot extends Component<ContextSnapshotSignature> {
  #contextRefs: ReturnType<typeof getAllContextRefs>;

  constructor(owner: Owner, args: ContextSnapshotSignature['Args']) {
    super(owner, args);

    this.#contextRefs = getAllContextRefs(this);
  }

  get contextRefs() {
    return this.#contextRefs;
  }
}
