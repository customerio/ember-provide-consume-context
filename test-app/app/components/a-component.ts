import Component from '@glimmer/component';
import { provide } from 'ember-provide-consume-context';

export interface AComponentSignature {
  Element: HTMLDivElement;
  Blocks: {
    default: [];
  };
}
export default class AComponent extends Component<AComponentSignature> {
  @provide('testContext')
  get value() {
    return 'asdf';
  }

  get noop() {
    return null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AComponent: typeof AComponent;
  }
}
