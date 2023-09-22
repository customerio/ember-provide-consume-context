import { CONTEXT_COMPONENT_INSTANCE_PROPERTY } from './symbols';

// TODO: See if we can type the owner
export function getProvider(owner: any, contextId: string) {
  const contextsObject = owner[CONTEXT_COMPONENT_INSTANCE_PROPERTY];
  return contextsObject?.[contextId];
}

export function hasContext(owner: any, contextId: string) {
  const provider = getProvider(owner, contextId);
  return provider != null;
}

export function getContextValue(owner: any, contextId: string) {
  if (!hasContext(owner, contextId)) {
    return undefined;
  }
  const provider = getProvider(owner, contextId);
  return provider.value;
}
