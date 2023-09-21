import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { hbs } from 'ember-cli-htmlbars';
import { getContextValue } from './get-context-value';

interface ContextProviderSignature<T> {
  Element: null;
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
  abstract defaultValue: T | null;

  get value(): T | null {
    return this.args.value ?? this.defaultValue;
  }
}

interface ContextConsumerSignature<T> {
  Element: null;
  Args: Record<string, never>;
  Blocks: {
    default: [T];
  };
}

export abstract class ContextConsumer<T> extends Component<
  ContextConsumerSignature<T>
> {
  abstract contextId: string;

  get contextValue() {
    return getContextValue(this, this.contextId) as T | null;
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
  Provider: typeof ContextProvider<T>;
  Consumer: typeof ContextConsumer<T>;
};

export function createContext<T>(defaultValue?: T): EmberContext<T> {
  const contextId = uniqueId();

  class Provider extends ContextProvider<T> {
    id = contextId;
    defaultValue = defaultValue ?? null;
  }
  // @ts-ignore setComponentTemplate doesn't have the correct types
  setComponentTemplate(hbs('{{yield}}'), Provider);

  class Consumer extends ContextConsumer<T> {
    contextId = contextId;
  }
  // @ts-ignore setComponentTemplate doesn't have the correct types
  setComponentTemplate(hbs('{{yield this.contextValue}}'), Consumer);

  return { _id: contextId, Provider, Consumer };
}
