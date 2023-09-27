import Component from '@glimmer/component';
import { consume } from '@customerio/ember-context';
import type ContextRegistry from '@customerio/ember-context/context-registry';

export interface TestComponentSignature {
  Element: HTMLDivElement;
}

export default class TestComponent extends Component<TestComponentSignature> {
  @consume('NumberContext') contextValue!: ContextRegistry['NumberContext'];
  @consume('testContext') contextValue2!: ContextRegistry['testContext'];
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    TestComponent: typeof TestComponent;
  }
}
