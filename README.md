# @customerio/ember-context

This addon provides a way to share data through to nested components without
having to pass arguments at each level (i.e. no prop drilling).

## Compatibility

- Ember.js v4.8 or above
- Embroider or ember-auto-import v2

## Installation

```
ember install @customerio/ember-context
```

## Usage
A new context can be created by using the `ContextProvider` component:

```hbs
<ContextProvider @key="my-key" @value={{this.someValue}}>
  ...
</ContextProvider>
```

The `value` can then be consumed in any descendant of that provider component by
using the `ContextConsumer` component:
```hbs
<ContextConsumer @key="my-key" as |value|>
  {{value}}
</ContextConsumer>
```

### `inject`
A context can also be retrieved from within a component class, similarly to how
Ember Services are consumed:

```ts
import Component from '@glimmer/component';
import { inject as context } from '@customerio/ember-context';

export default class MyChildComponent extends Component {
  @context('my-key') myContextValue!: string;
}
```

### TypeScript
For typing the context values, we expose a `ContextKey` interface. It's a
generic interface that extends `Symbol` and accepts the type of the value we're
intending to use within the context:

```ts
import Component from '@glimmer/component';
import type { ContextKey } from '@customerio/ember-context';

const myContext = Symbol() as ContextKey<string>;

export default class MyComponent extends Component {
  myContext = myContext;
}
```

```hbs
<ContextProvider @key={{this.myContext}} @value={{this.someValue}}>
  ...
</ContextProvider>
```

The symbol can then be imported wherever we intend to consume the value:
```hbs
<ContextConsumer @key={{this.myContext}} as |value|>
  {{value}}
  {{!-- In Glint-enabled projects, value will infer the correct type thanks to
        the myContext generic --}}
</ContextConsumer>
```

Similarly, the `inject` decorator can accept the context symbol. We also include
a utility `ExtractContextType` type, which makes it easier to extract the type
of the context's value:

```ts
import Component from '@glimmer/component';
import { inject as context, type ExtractContextType } from '@customerio/ember-context';
import { myContext } from './somewhere';

export default class MyChildComponent extends Component {
  @context(myContext) myContextValue!: ExtractContextType<typeof myContext>;

  get someComputed() {
    // myContextValue will be recognized as a string
    return this.myContextValue;
  }
}
```


## Inspiration
The idea was to create an API similar to the Context API in React
- [`React Context API`](https://react.dev/reference/react/createContext): The
  original inspiration for this project is, of course, the React Context
- [`Svelte Context API`](https://svelte.dev/docs/svelte#setcontext): Svelte
  exposes contexts via simple `setContext` and `getContext` functions, but
  provides no built-in way to assign and extract types
- [`Vue provide/inject`](https://vuejs.org/guide/components/provide-inject.html#provide):
  Our addon borrows the Symbol-based key and TypeScript approach, which allows
  us to infer types from context keys
- [`ember-context`](https://github.com/alexlafroscia/ember-context): Another
  Ember addon that also implements a similar Context API. However, that addon's
  implementation relies has providers racing on a provider key, while our addon
  uses the actual Ember component tree

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.
