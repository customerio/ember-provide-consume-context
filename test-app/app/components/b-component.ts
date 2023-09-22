import templateOnlyComponent from '@ember/component/template-only';

interface BComponentSignature {
  Element: HTMLDivElement;
}

const BComponent = templateOnlyComponent<BComponentSignature>();

export default BComponent;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    BComponent: typeof BComponent;
  }
}
