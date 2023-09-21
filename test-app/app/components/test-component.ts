import Component from '@glimmer/component';
import { inject as context } from '@customerio/ember-context';
import { NumberContext } from 'test-app/controllers/application';
import { contextValueType } from '@customerio/ember-context/create-context-6359e4ca';

export default class TestComponent extends Component {
  @context(NumberContext) contextValue!: contextValueType<typeof NumberContext>;
}
