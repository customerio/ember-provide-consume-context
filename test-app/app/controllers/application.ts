import Controller from '@ember/controller';
import type { ContextKey } from '@customerio/ember-context';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export const numberContext = Symbol() as ContextKey<number>;

export default class ApplicationController extends Controller {
  numberContext = numberContext;

  @tracked numberOne = 1;
  @tracked numberTwo = 1;

  @action
  increment(property: 'numberOne' | 'numberTwo') {
    this[property]++;
  }
}
