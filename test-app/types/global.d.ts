// import 'ember-source/types';
// import 'ember-source/types/preview';
import '@glint/environment-ember-loose';

import type EmberContextTemplateRegistry from 'ember-provide-consume-context/template-registry';
import Helper from '@ember/component/helper';

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry extends EmberContextTemplateRegistry {
    'page-title': new () => Helper<{
      Args: { Positional: [string] };
      Return: void;
    }>;
  }
}
