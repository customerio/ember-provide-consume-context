import Component from '@glimmer/component';
import { inject as context } from '@customerio/ember-context';
import type { ExtractContextType } from '@customerio/ember-context';
import { numberContext } from 'test-app/controllers/application';

export default class TestComponent extends Component {
  @context(numberContext, 5) contextValue!: ExtractContextType<
    typeof numberContext
  >;
}
