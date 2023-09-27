import Component from '@glimmer/component';
import {
  inject as context,
  inject2 as context2,
} from '@customerio/ember-context';
import { NumberContext } from 'test-app/controllers/application';
import type { contextValueType } from '@customerio/ember-context';

export interface TestComponentSignature {
  Element: HTMLDivElement;
}

export default class TestComponent extends Component<TestComponentSignature> {
  @context(NumberContext) contextValue!: contextValueType<typeof NumberContext>;
  @context2('testContext') contextValue2!: any;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    TestComponent: typeof TestComponent;
  }
}
