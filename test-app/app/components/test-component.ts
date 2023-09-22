import Component from '@glimmer/component';
import { inject as context } from '@customerio/ember-context';
import type { ExtractContextType } from '@customerio/ember-context';
import { numberContext } from 'test-app/controllers/application';
export interface TestComponentSignature {
  Element: HTMLDivElement;
}

export default class TestComponent extends Component<TestComponentSignature> {
  @context(numberContext, 5) contextValue!: ExtractContextType<
    typeof numberContext
  >;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    TestComponent: typeof TestComponent;
  }
}
