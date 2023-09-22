import '@glint/environment-ember-loose';
import type EmberContextRegistry from '@customerio/ember-context/template-registry';

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry
    extends EmberContextRegistry /* other addon registries */ {
    // local entries
  }
}
