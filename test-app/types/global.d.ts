// Types for compiled templates
declare module 'test-app/templates/*' {
  import { TemplateFactory } from 'ember-cli-htmlbars';

  const tmpl: TemplateFactory;
  export default tmpl;
}

declare module '@customerio/ember-context/context-registry' {
  export default interface ContextRegistry {
    testContext: string;
  }
}
