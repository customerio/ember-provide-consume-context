import type { ComponentInstance } from '@glimmer/interfaces';
import type ContextRegistry from '../context-registry';
export declare const DECORATED_PROPERTY_CLASSES: WeakMap<any, Record<string | number, string>>;
export declare const PROVIDER_INSTANCES: WeakMap<any, Record<string, string>>;
export declare function trackProviderInstanceContexts(instance: any, contextDefinitions: [
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
export declare class ProvideConsumeContextContainer {
    private stack;
    get current(): unknown;
    contexts: WeakMap<any, Contexts>;
    begin(): void;
    commit(): void;
    private reset;
    enter(instance: ComponentInstance): void;
    exit(instance: ComponentInstance): void;
    private registerProvider;
    private registerComponent;
}
export {};
//# sourceMappingURL=provide-consume-context-container.d.ts.map