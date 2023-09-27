// Importing the module triggers TS declaration merging
import '@customerio/ember-context/context-registry';

// Define global context types here, or declare them in the modules where
// they're provided.
declare module '@customerio/ember-context/context-registry' {
  export default interface ContextRegistry {
    NumberContext: number;
  }
}
