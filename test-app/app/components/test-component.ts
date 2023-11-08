import Component from '@glimmer/component';
import { consume } from 'ember-provide-consume-context';
import type ContextRegistry from 'ember-provide-consume-context/context-registry';
import { NumberContext } from 'test-app/controllers/application';

export interface TestComponentSignature {
  Element: HTMLDivElement;
}

export default class TestComponent extends Component<TestComponentSignature> {
  @consume(NumberContext) contextValue!: ContextRegistry[typeof NumberContext];
  @consume('testContext') contextValue2!: ContextRegistry['testContext'];
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    TestComponent: typeof TestComponent;
  }
}
