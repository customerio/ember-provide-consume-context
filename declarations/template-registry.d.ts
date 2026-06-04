import type ContextConsumer from './components/context-consumer';
import type ContextProvider from './components/context-provider';
import type ContextSnapshot from './components/context-snapshot';
import type ProvideContexts from './components/provide-contexts';
export default interface Registry {
    ContextConsumer: typeof ContextConsumer;
    ContextProvider: typeof ContextProvider;
    ContextSnapshot: typeof ContextSnapshot;
    ProvideContexts: typeof ProvideContexts;
}
//# sourceMappingURL=template-registry.d.ts.map