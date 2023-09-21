import { CONTEXT_COMPONENT_INSTANCE_PROPERTY } from './symbols';

// TODO: See if we can type the owner
export function getContextValue(owner: any, contextId: string) {
  const contextsObject = owner[CONTEXT_COMPONENT_INSTANCE_PROPERTY];

  if (contextsObject == null) {
    return null;
  }

  const provider = contextsObject[contextId];

  if (provider == null) {
    // Should we throw an error instead?
    return null;
  }

  return provider.value;
}
