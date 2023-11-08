// Importing the module triggers TS declaration merging
import 'ember-provide-consume-context/context-registry';

// Define global context types here, or declare them in the modules where
// they're provided.
declare module 'ember-provide-consume-context/context-registry' {
  export default interface ContextRegistry {
    'some-number-context': number;
  }
}
