import Controller from '@ember/controller';
import { createContext } from '@customerio/ember-context';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export const NumberContext = createContext<number>(123);

export default class ApplicationController extends Controller {
  NumberContext = NumberContext;

  @tracked numberOne = 1;
  @tracked numberTwo = 1;

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
    return document.querySelector('#inelementtarget');
  }
}
