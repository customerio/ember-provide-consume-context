import Component from '@glimmer/component';
import { consume } from '@customerio/ember-context';

export interface TestComponentSignature {
  Element: HTMLDivElement;
}

export default class TestComponent extends Component<TestComponentSignature> {
  @consume('NumberContext') contextValue!: number;
  @consume('testContext') contextValue2!: any;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    TestComponent: typeof TestComponent;
  }
}
