import { CONTEXT_COMPONENT_INSTANCE_PROPERTY } from './symbols';

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-unused-vars
export interface ContextKey<T> extends Symbol {}
export type ExtractContextType<T> = T extends ContextKey<infer U> ? U : never;

// TODO: See if we can type the owner
export function getProvider<T>(owner: any, contextKey: ContextKey<T> | string) {
  const contextsObject = owner[CONTEXT_COMPONENT_INSTANCE_PROPERTY];
  // TS complains about:
  // Type ContextKey<T> cannot be used as index type
  // so we cast as symbol | string
  return contextsObject?.[contextKey as symbol | string];
}

export function hasContext<T>(owner: any, contextKey: ContextKey<T> | string) {
  return getProvider(owner, contextKey) != null;
}

export function getContextValue<T>(
  owner: any,
  contextKey: ContextKey<T> | string,
) {
  if (!hasContext(owner, contextKey)) {
    return undefined;
  }
  const provider = getProvider(owner, contextKey);
  return provider.value;
}
