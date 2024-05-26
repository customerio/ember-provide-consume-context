import Component from '@glimmer/component';
import type ContextRegistry from '../context-registry';
interface ContextConsumerSignature<K extends keyof ContextRegistry> {
    Args: {
        key: K;
        defaultValue?: ContextRegistry[K];
    };
    Blocks: {
        default: [ContextRegistry[K] | null];
    };
}
export default class ContextConsumer<K extends keyof ContextRegistry> extends Component<ContextConsumerSignature<K>> {
    get contextValue(): ContextRegistry[K] | null;
}
export {};
//# sourceMappingURL=context-consumer.d.ts.map