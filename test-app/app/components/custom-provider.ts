import Component from '@glimmer/component';
import { provide } from '@customerio/ember-context';

export interface CustomProviderComponentSignature {
  Args: {
    value: unknown;
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
