import Controller from '@ember/controller';
import { createContext } from '@customerio/ember-context';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export const NumberContext = createContext<number>(5);

export default class ApplicationController extends Controller {
  NumberContext = NumberContext;

  @tracked numberOne = 1;
  @tracked numberTwo = 1;

  @action
  increment(property: 'numberOne' | 'numberTwo') {
    this[property]++;
  }
}
