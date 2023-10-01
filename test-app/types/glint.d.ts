import '@glint/environment-ember-loose';
import '@glint/environment-ember-template-imports';
import type EmberContextTemplateRegistry from '@customerio/ember-context/template-registry';
import Helper from '@ember/component/helper';

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry extends EmberContextTemplateRegistry {
    'page-title': new () => Helper<{
      Args: { Positional: [string] };
      Return: void;
    }>;
  }
}
