import type { ComponentInstance } from '@glimmer/interfaces';
import type ContextRegistry from '../context-registry';
export declare const EMBER_PROVIDE_CONSUME_CONTEXT_KEY: unique symbol;
export declare const EMBER_PROVIDE_CONSUME_CONTEXT_CONTAINER_KEY: unique symbol;
export declare function contextContainerFor(component: any): any;
export declare function setContextMetadataOnContextProviderInstance(instance: any, contextDefinitions: [
    contextKey: keyof ContextRegistry,
    propertyKey: string
][]): void;
interface Contexts {
    [contextKey: keyof ContextRegistry]: ContextEntry;
}
interface ContextEntry {
    instance: any;
    key: string;
}
/**
 * A reference to one visible context provider.
 *
 * This keeps a reference to the provider instance rather than copying the
 * current value, so `value` reads stay connected to tracked provider state.
 */
export declare class ContextRef<K extends keyof ContextRegistry = keyof ContextRegistry> {
    #private;
    constructor(contextKey: K, context: ContextEntry);
    get contextKey(): K;
    get value(): ContextRegistry[K] | undefined;
}
/**
 * A captured set of context references visible to a component.
 *
 * The set of provider references is fixed when the refs are created, but values
 * are read from the original provider instances. That lets bridged consumers
 * continue to observe tracked provider values.
 */
export declare class ContextRefs {
    #private;
    constructor(contexts?: Contexts | null | undefined);
    entries(): [string | number, ContextRef<string | number>][];
    getRef<K extends keyof ContextRegistry>(contextKey: K): ContextRef<K> | undefined;
    get<K extends keyof ContextRegistry>(contextKey: K): ContextRegistry[K] | undefined;
}
export type ContextRefsInput = ContextRef | ContextRefs | null | undefined;
/**
 * Registers an instance as a provider for every context ref.
 *
 * `provideContextRefs` is the public API for consumers. This private helper keeps
 * the same metadata path as the built-in provider component.
 */
export declare function setContextMetadataOnContextRefsProviderInstance(instance: object, contextRefs: ContextRefsInput): void;
export declare class ProvideConsumeContextContainer {
    #private;
    private stack;
    get current(): unknown;
    parentContexts: WeakMap<any, Contexts>;
    nextContexts: WeakMap<any, Contexts>;
    begin(): void;
    commit(): void;
    private reset;
    registerMockProvider: <T extends string | number, U extends ContextRegistry[T]>(name: T, value: U) => void;
    enter(instance: ComponentInstance): void;
    exit(instance: ComponentInstance): void;
    private registerProvider;
    private registerComponent;
    currentContexts(): {
        [x: string]: ContextEntry;
        [x: number]: ContextEntry;
    };
    contextsFor(component: any): Contexts | null | undefined;
    createComponent(): void;
}
export {};
//# sourceMappingURL=provide-consume-context-container.d.ts.map