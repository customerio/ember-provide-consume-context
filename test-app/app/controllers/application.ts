import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export const NumberContext = 'NumberContext' as const;

export default class ApplicationController extends Controller {
  @tracked numberOne = 1;
  @tracked numberTwo = 1;

  NumberContext = NumberContext;

  @tracked show = true;
  @tracked show2 = true;

  @action toggle() {
    this.show = !this.show;
  }
  @action toggle2() {
    this.show2 = !this.show2;
  }

  @action
  increment(property: 'numberOne' | 'numberTwo') {
    this[property]++;
  }

  get inelementtarget() {
    return document.querySelector('#inelementtarget') as HTMLElement;
  }
}

declare module '@customerio/ember-context/context-registry' {
  export default interface ContextRegistry {
    [NumberContext]: number;
  }
}
