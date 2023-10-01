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
### Context providers
Data can be provided to all of a component's descendants in one of two ways:
1. The `provide` decorator
2. The `ContextProvider` component

#### `@provide`
This library exports a decorator, which can be used on any getter or property to
expose it as context to all descendants of the component. The decorator requires
a string argument that is the name of the context, which will be used by
descendants to look up the value.

```ts
import Component from '@glimmer/component';
import { provide } from '@customerio/ember-context';

export default class MyComponent extends Component {
  @provide('my-context-name')
  get someState() {
    return 'some value';
  }
}
```

It is possible to expose tracked properties in context, by adding a
`@provide`-decorated getter, like so:

```ts
import Component from '@glimmer/component';
import { provide } from '@customerio/ember-context';

export default class MyComponent extends Component {
  @tracked myTrackedValue = 'some value';

  @provide('my-context-name')
  get someState() {
    return this.myTrackedValue;
    // or expressions like return this.args.someArgument;
  }
}
```

Any descendants retrieving this context will automatically recompute when the
tracked property changes.

Note: For the purposes of the decorator, it doesn't matter what the getter is
named. The value of the getter will be exposed under the context name.

#### `ContextProvider`
Alternatively, this addon also provides a `ContextProvider` component:

```hbs
<ContextProvider @key="my-context-name" @value={{this.someValue}}>
  {{! descendant components can now look up "my-context-name" }}
</ContextProvider>
```

### Context consumers
There are also two ways to retrieve a context value:
1. Using the `consume` decorator
2. Using the `ContextConsumer` component

#### `@consume`
The `consume` decorator allows us to retrieve a context value in a way that's
similar to working with an Ember service:

```ts
import Component from '@glimmer/component';
import { consume } from '@customerio/ember-context';

export default class MyChildComponent extends Component {
  @consume('my-context-name') myContextValue!: string;
}
```

```hbs
  <p>The context value is: {{this.myContextValue}}</p>
```

#### `ContextConsumer`
Alternatively, a context value can be retrieved with the `ContextConsumer`
component. It accepts a `@key` string argument, which is the name of the
context, and it yields the value of the context:
```hbs
<ContextConsumer @key="my-context-name" as |value|>
  {{value}}
</ContextConsumer>
```

### TypeScript
Currently, context names are just strings, and this library doesn't yet provide
a way to automatically assign or infer types based on context names.


## Inspiration
The idea was to create an API similar to the Context API in React
- [`React Context API`](https://react.dev/reference/react/createContext): The
  original inspiration for this project is, of course, the React Context
- [`Svelte Context API`](https://svelte.dev/docs/svelte#setcontext): Svelte
  exposes contexts via simple `setContext` and `getContext` functions
- [`Vue provide/inject`](https://vuejs.org/guide/components/provide-inject.html#provide):
  Vue allows working with context via `provide` and `inject` functions
- [`ember-context`](https://github.com/alexlafroscia/ember-context): Another
  Ember addon that also implements a similar Context API. However, that addon's
  implementation relies has providers racing on a provider key, while our addon
  uses the actual Ember component tree

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.


## License

This project is licensed under the [MIT License](LICENSE.md).
