import { getOwner } from '@ember/application';
import Helper from '@ember/component/helper';
import { NumberContext } from 'test-app/controllers/application';

export default class MyClassicHelper extends Helper {
  compute(_positional: any, _named: any) {
    const renderer = getOwner(this).lookup('renderer:-dom') as any;

    if (renderer == null) {
      return null;
    }

    const contextContainer =
      renderer?._runtime?.env?.provideConsumeContextContainer;

    if (contextContainer == null) {
      return null;
    }

    const currentStackItem = contextContainer.current;
    const currentStackItemContexts =
      contextContainer.contexts.get(currentStackItem);
    return currentStackItemContexts?.[NumberContext._id]?.value;
  }
}
