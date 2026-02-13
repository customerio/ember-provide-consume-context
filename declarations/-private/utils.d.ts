import type ContextRegistry from '../context-registry';
export declare function getProvider(component: object, contextKey: keyof ContextRegistry): any;
/**
 * Checks whether a context with the given key exists for the provided component.
 *
 * @param {Object} component - The component to check for the context.
 * @param {string} contextKey - The key of the context to check for.
 */
export declare function hasContext(component: object, contextKey: keyof ContextRegistry): boolean;
/**
 * Returns the value of the context for the given key, if one exists.
 *
 * @param {Object} component - The component to check for the context.
 * @param {string} contextKey - The key of the context to check for.
 */
export declare function getContextValue<K extends keyof ContextRegistry>(component: object, contextKey: K): ContextRegistry[K] | undefined;
//# sourceMappingURL=utils.d.ts.map