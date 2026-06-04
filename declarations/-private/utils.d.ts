import type ContextRegistry from '../context-registry';
import { ContextRef, ContextRefs, type ContextRefsInput } from './provide-consume-context-container';
interface ProviderEntry {
    instance: any;
    key: string;
}
export interface GetContextRefsOptions {
    /**
     * Context keys to include in the refs.
     */
    contextKeys: readonly (keyof ContextRegistry)[];
}
export declare function getProvider(component: object, contextKey: keyof ContextRegistry): ProviderEntry | null | undefined;
/**
 * Captures a context provider reference visible to a component.
 *
 * This returns a provider reference, not the current value. Pass the ref to
 * `provideContextRefs` to bridge one context into another render root.
 */
export declare function getContextRef<K extends keyof ContextRegistry>(component: object, contextKey: K): ContextRef<K> | undefined;
/**
 * Captures selected context provider references visible to a component.
 *
 * This is useful when rendering a new root with Ember's `renderComponent` API.
 * A new root does not automatically inherit context from the DOM element it is
 * mounted into, so pass these refs into that root and re-provide them with
 * `provideContextRefs`.
 */
export declare function getContextRefs(component: object, options: GetContextRefsOptions): ContextRefs;
export declare function getContextRefs(component: object, options?: GetContextRefsOptions): ContextRefs | undefined;
/**
 * Captures every context provider reference visible to a component.
 */
export declare function getAllContextRefs(component: object): ContextRefs;
/**
 * Provides context refs from the given component.
 *
 * Call this during component construction so descendants are created after the
 * component has been registered as a context provider.
 */
export declare function provideContextRefs(component: object, contextRefs: ContextRefsInput): void;
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
export {};
//# sourceMappingURL=utils.d.ts.map