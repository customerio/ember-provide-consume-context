import Component from '@glimmer/component';

export interface AComponentSignature {
  Element: HTMLDivElement;
  Blocks: {
    default: [];
  };
}
export default class AComponent extends Component<AComponentSignature> {
  get noop() {
    return null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AComponent: typeof AComponent;
  }
}
