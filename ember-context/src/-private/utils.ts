import { getOwner } from '@ember/owner';

// TODO: See if we can type the owner
export function getProvider(owner: any, contextKey: string) {
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
  return contextsObject?.[contextKey];
}

export function hasContext(owner: any, contextKey: string) {
  const provider = getProvider(owner, contextKey);
  return provider != null;
}

export function getContextValue(owner: any, contextKey: string) {
  if (!hasContext(owner, contextKey)) {
    return undefined;
  }
  const providerObj = getProvider(owner, contextKey);
  return providerObj.instance[providerObj.key];
}
