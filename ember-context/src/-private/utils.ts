import { getOwner } from '@ember/owner';

// TODO: See if we can type the owner
export function getProvider(owner: any, contextId: string) {
  const renderer = getOwner(owner)?.lookup('renderer:-dom') as any;

  if (renderer == null) {
    return null;
  }

  const provideConsumeContextContainer =
    renderer._runtime?.env?.provideConsumeContextContainer;

  if (provideConsumeContextContainer == null) {
    return null;
  }

  const contextsObject = provideConsumeContextContainer.contexts.get(owner);
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
  const providerObj = getProvider(owner, contextId);
  return providerObj.instance[providerObj.key];
}
