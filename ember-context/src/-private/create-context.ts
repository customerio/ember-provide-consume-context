import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { hbs } from 'ember-cli-htmlbars';
import { getContextValue, hasContext } from './utils';

interface ContextProviderSignature<T> {
  Args: {
    value: T;
  };
  Blocks: {
    default: [];
  };
}

export abstract class ContextProvider<T> extends Component<
  ContextProviderSignature<T>
> {
  abstract id: string;

  get value(): T {
    return this.args.value;
  }
}

interface ContextConsumerSignature<T> {
  Blocks: {
    default: [T];
  };
}

export abstract class ContextConsumer<T> extends Component<
  ContextConsumerSignature<T>
> {
  abstract contextId: string;
  abstract defaultValue?: T;

  get contextValue() {
    if (hasContext(this, this.contextId)) {
      return getContextValue(this, this.contextId) as T;
    }

    return this.defaultValue;
  }
}

// https://github.com/emberjs/ember.js/blob/v5.2.0/packages/%40ember/-internals/glimmer/lib/helpers/unique-id.ts#L5
export function uniqueId(): string {
  // @ts-expect-error See above github link for details
  return ([3e7] + -1e3 + -4e3 + -2e3 + -1e11).replace(/[0-3]/g, (a) =>
    ((a * 4) ^ ((Math.random() * 16) >> (a & 2))).toString(16),
  );
}

export type EmberContext<T> = {
  _id: string;
  _defaultValue: T | null;
  Provider: typeof ContextProvider<T>;
  Consumer: typeof ContextConsumer<T>;
};

export type contextValueType<T> = T extends EmberContext<infer U> ? U : never;

export function createContext<T>(defaultValue?: T): EmberContext<T> {
  const contextId = uniqueId();

  class Provider extends ContextProvider<T> {
    id = contextId;
  }
  // @ts-ignore setComponentTemplate doesn't have the correct types
  setComponentTemplate(hbs`{{! @glint-nocheck }}{{yield}}`, Provider);

  class Consumer extends ContextConsumer<T> {
    contextId = contextId;
    defaultValue = defaultValue;
  }
  setComponentTemplate(
    // @ts-ignore setComponentTemplate doesn't have the correct types
    hbs`{{! @glint-nocheck }}{{yield this.contextValue}}`,
    Consumer,
  );

  return {
    _id: contextId,
    _defaultValue: defaultValue ?? null,
    Provider,
    Consumer,
  };
}
