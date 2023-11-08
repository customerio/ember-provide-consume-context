import Component from '@glimmer/component';
import { provide } from 'ember-provide-consume-context';
import type ContextRegistry from 'ember-provide-consume-context/context-registry';

export interface CustomProviderComponentSignature {
  Args: {
    value: ContextRegistry['testContext'];
  };
  Element: HTMLDivElement;
  Blocks: {
    default: [];
  };
}

export default class CustomProviderComponent extends Component<CustomProviderComponentSignature> {
  @provide('testContext')
  get value() {
    return this.args.value;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    CustomProvider: typeof CustomProviderComponent;
  }
}

declare module 'ember-provide-consume-context/context-registry' {
  export default interface ContextRegistry {
    testContext: string | number;
  }
}
