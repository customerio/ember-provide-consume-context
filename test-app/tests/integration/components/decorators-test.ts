import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { consume, provide } from 'ember-provide-consume-context';
import { tracked } from '@glimmer/tracking';

module('Integration | Decorators', function (hooks) {
  setupRenderingTest(hooks);

  test('consuming a non-existent context returns `undefined`', async function (assert) {
    class TestConsumerComponent extends Component<{
      Element: HTMLDivElement;
    }> {
      @consume('my-test-context') contextValue: string | undefined;
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content">{{if (eq this.contextValue undefined) "undefined" "other"}}</div>
      `,
      TestConsumerComponent,
    );

    interface TestContext {
      TestConsumerComponent: typeof TestConsumerComponent;
    }
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;

    await render<TestContext>(hbs`<this.TestConsumerComponent />`);

    assert.dom('#content').hasText('undefined');
  });

  test('a consumer can read context', async function (assert) {
    class TestProviderComponent extends Component<{
      Element: HTMLDivElement;
      Blocks: {
        default: [];
      };
    }> {
      @provide('my-test-context')
      get myState() {
        return '1';
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div>{{yield}}</div>
      `,
      TestProviderComponent,
    );

    class TestConsumerComponent extends Component<{
      Element: HTMLDivElement;
    }> {
      @consume('my-test-context') contextValue!: string;
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content">{{this.contextValue}}</div>
      `,
      TestConsumerComponent,
    );

    interface TestContext {
      TestProviderComponent: typeof TestProviderComponent;
      TestConsumerComponent: typeof TestConsumerComponent;
    }
    (this as unknown as TestContext).TestProviderComponent =
      TestProviderComponent;
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;

    await render<TestContext>(hbs`
      <this.TestProviderComponent>
        <this.TestConsumerComponent />
      </this.TestProviderComponent>
    `);

    assert.dom('#content').hasText('1');
  });

  test('providing a class instance', async function (assert) {
    class MyTestClass {
      @tracked value = 1;
    }

    const testInstance = new MyTestClass();

    class TestProviderComponent extends Component<{
      Element: HTMLDivElement;
      Blocks: {
        default: [];
      };
    }> {
      @provide('my-test-context')
      contextState = testInstance;
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div>{{yield}}</div>
      `,
      TestProviderComponent,
    );

    class TestConsumerComponent extends Component<{
      Element: HTMLDivElement;
    }> {
      @consume('my-test-context') contextValue!: string;
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content">{{this.contextValue.value}}</div>
      `,
      TestConsumerComponent,
    );

    interface TestContext {
      TestProviderComponent: typeof TestProviderComponent;
      TestConsumerComponent: typeof TestConsumerComponent;
    }
    (this as unknown as TestContext).TestProviderComponent =
      TestProviderComponent;
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;

    await render<TestContext>(hbs`
      <this.TestProviderComponent>
        <this.TestConsumerComponent />
      </this.TestProviderComponent>
    `);

    assert.dom('#content').hasText('1');

    testInstance.value = 2;
    await settled();
    assert.dom('#content').hasText('2');
  });

  test('a consumer can read context during initialization', async function (assert) {
    class TestProviderComponent extends Component<{
      Element: HTMLDivElement;
      Blocks: {
        default: [];
      };
    }> {
      @provide('my-test-context')
      get myState() {
        return '1';
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div>{{yield}}</div>
      `,
      TestProviderComponent,
    );

    class TestConsumerComponent extends Component<{
      Element: HTMLDivElement;
    }> {
      @consume('my-test-context') _contextValue!: string;

      contextValue = this._contextValue;
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content">{{this.contextValue}}</div>
      `,
      TestConsumerComponent,
    );

    interface TestContext {
      TestProviderComponent: typeof TestProviderComponent;
      TestConsumerComponent: typeof TestConsumerComponent;
    }
    (this as unknown as TestContext).TestProviderComponent =
      TestProviderComponent;
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;

    await render<TestContext>(hbs`
      <this.TestProviderComponent>
        <this.TestConsumerComponent />
      </this.TestProviderComponent>
    `);

    assert.dom('#content').hasText('1');
  });

  test('a provider can read parent provider with same key in constructor', async function (assert) {
    class TestProviderComponent extends Component<{
      Element: HTMLDivElement;
      Blocks: {
        default: [];
      };
    }> {
      @provide('my-test-context')
      get myState() {
        return '1';
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div>{{yield}}</div>
      `,
      TestProviderComponent,
    );

    class TestProviderComponent2 extends Component<{
      Element: HTMLDivElement;
      Blocks: {
        default: [];
      };
    }> {
      @consume('my-test-context') _parentContextValue!: string;
      parentContextValue = this._parentContextValue;

      @provide('my-test-context')
      get myState() {
        return '2';
      }

      @provide('my-test-parent-context')
      get myParentState() {
        return this.parentContextValue;
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div>{{yield}}</div>
      `,
      TestProviderComponent2,
    );

    class TestConsumerComponent extends Component<{
      Element: HTMLDivElement;
    }> {
      @consume('my-test-context') contextValue!: string;
      @consume('my-test-parent-context') parentContextValue!: string;
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content">{{this.contextValue}}</div>
        {{! @glint-ignore }}
        <div id="parent-content">{{this.parentContextValue}}</div>
      `,
      TestConsumerComponent,
    );

    interface TestContext {
      TestProviderComponent: typeof TestProviderComponent;
      TestProviderComponent2: typeof TestProviderComponent2;
      TestConsumerComponent: typeof TestConsumerComponent;
    }
    (this as unknown as TestContext).TestProviderComponent =
      TestProviderComponent;
    (this as unknown as TestContext).TestProviderComponent2 =
      TestProviderComponent2;
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;

    await render<TestContext>(hbs`
      <this.TestProviderComponent>
        <this.TestProviderComponent2>
          <this.TestConsumerComponent />
        </this.TestProviderComponent2>
      </this.TestProviderComponent>
    `);

    assert.dom('#content').hasText('2');
    assert.dom('#parent-content').hasText('1');
  });

  test('a component can provide multiple contexts', async function (assert) {
    class TestProviderComponent extends Component<{
      Element: HTMLDivElement;
      Blocks: {
        default: [];
      };
    }> {
      @provide('my-test-context-1')
      get myState1() {
        return '1';
      }

      @provide('my-test-context-2')
      get myState2() {
        return '2';
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div>{{yield}}</div>
      `,
      TestProviderComponent,
    );

    class TestConsumerComponent extends Component<{
      Element: HTMLDivElement;
    }> {
      @consume('my-test-context-1') contextValue1!: string;
      @consume('my-test-context-2') contextValue2!: string;
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content-1">{{this.contextValue1}}</div>
        {{! @glint-ignore }}
        <div id="content-2">{{this.contextValue2}}</div>
      `,
      TestConsumerComponent,
    );

    interface TestContext {
      TestProviderComponent: typeof TestProviderComponent;
      TestConsumerComponent: typeof TestConsumerComponent;
    }
    (this as unknown as TestContext).TestProviderComponent =
      TestProviderComponent;
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;

    await render<TestContext>(hbs`
      <this.TestProviderComponent>
        <this.TestConsumerComponent />
      </this.TestProviderComponent>
    `);

    assert.dom('#content-1').hasText('1');
    assert.dom('#content-2').hasText('2');
  });

  test('the built-in consumer can read context where provider uses decorator', async function (assert) {
    class TestProviderComponent extends Component<{
      Element: HTMLDivElement;
      Blocks: {
        default: [];
      };
    }> {
      @provide('my-test-context')
      get myState() {
        return '1';
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div>{{yield}}</div>
      `,
      TestProviderComponent,
    );

    interface TestContext {
      TestProviderComponent: typeof TestProviderComponent;
    }
    (this as unknown as TestContext).TestProviderComponent =
      TestProviderComponent;

    await render<TestContext>(hbs`
      <this.TestProviderComponent>
        <ContextConsumer @key="my-test-context" as |count|>
          <div id="content">{{count}}</div>
        </ContextConsumer>
      </this.TestProviderComponent>
    `);

    assert.dom('#content').hasText('1');
  });

  test('a consumer updates when provider values change', async function (assert) {
    class TestProviderComponent extends Component<{
      Element: HTMLDivElement;
      Blocks: {
        default: [];
      };
    }> {
      @tracked count1 = 1;
      @tracked count2 = 30;

      @provide('my-test-context-1')
      get myState1() {
        return this.count1;
      }

      @provide('my-test-context-2')
      get myState2() {
        return this.count2;
      }

      increment1 = () => {
        this.count1++;
      };

      increment2 = () => {
        this.count2++;
      };
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`
        <div>
          <div>
            {{! @glint-ignore }}
            <button {{on "click" this.increment1}} id="increment-1" type="button">Increment 1</button>
          </div>
          <div>
            {{! @glint-ignore }}
            <button {{on "click" this.increment2}} id="increment-2" type="button">Increment 2</button>
          </div>

          <div>
            {{! @glint-ignore }}
            {{yield}}
          </div>
        </div>
      `,
      TestProviderComponent,
    );

    class TestConsumerComponent extends Component<{
      Element: HTMLDivElement;
    }> {
      @consume('my-test-context-1') contextValue1!: string;
      @consume('my-test-context-2') contextValue2!: string;
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content-1">{{this.contextValue1}}</div>
        {{! @glint-ignore }}
        <div id="content-2">{{this.contextValue2}}</div>
      `,
      TestConsumerComponent,
    );

    interface TestContext {
      TestProviderComponent: typeof TestProviderComponent;
      TestConsumerComponent: typeof TestConsumerComponent;
    }
    (this as unknown as TestContext).TestProviderComponent =
      TestProviderComponent;
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;

    await render<TestContext>(hbs`
      <this.TestProviderComponent>
        <this.TestConsumerComponent />
      </this.TestProviderComponent>
    `);

    assert.dom('#content-1').hasText('1');

    await click('#increment-1');
    assert.dom('#content-1').hasText('2');

    assert.dom('#content-2').hasText('30');

    await click('#increment-2');
    assert.dom('#content-2').hasText('31');
  });

  test('sibling contexts with same key (multiple instances of a provider component)', async function (assert) {
    class TestProviderComponent extends Component<{
      Args: {
        value: number;
      };
      Element: HTMLDivElement;
      Blocks: {
        default: [];
      };
    }> {
      @provide('my-test-context')
      get myState() {
        return this.args.value;
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div>{{yield}}</div>
      `,
      TestProviderComponent,
    );

    class TestConsumerComponent extends Component<{
      Args: {
        id: string;
      };
      Element: HTMLDivElement;
    }> {
      @consume('my-test-context') contextValue!: string;
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content-{{@id}}">{{this.contextValue}}</div>
      `,
      TestConsumerComponent,
    );

    interface TestContext {
      TestProviderComponent: typeof TestProviderComponent;
      TestConsumerComponent: typeof TestConsumerComponent;
    }
    (this as unknown as TestContext).TestProviderComponent =
      TestProviderComponent;
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;

    await render<TestContext>(hbs`
      <this.TestProviderComponent @value={{1}}>
        <this.TestConsumerComponent @id="1" />
      </this.TestProviderComponent>
      <this.TestProviderComponent @value={{2}}>
        <this.TestConsumerComponent @id="2" />
      </this.TestProviderComponent>
    `);

    assert.dom('#content-1').hasText('1');
    assert.dom('#content-2').hasText('2');
  });

  test("a consumer can't access a context it's not nested in", async function (assert) {
    class TestProviderComponent1 extends Component<{
      Element: HTMLDivElement;
      Blocks: {
        default: [];
      };
    }> {
      @provide('my-test-context-1')
      get myState() {
        return 1;
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div>{{yield}}</div>
      `,
      TestProviderComponent1,
    );

    class TestProviderComponent2 extends Component<{
      Element: HTMLDivElement;
      Blocks: {
        default: [];
      };
    }> {
      @provide('my-test-context-2')
      get myState() {
        return 2;
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div>{{yield}}</div>
      `,
      TestProviderComponent2,
    );

    class TestConsumerComponent extends Component<{
      Args: {
        id: string;
      };
      Element: HTMLDivElement;
    }> {
      @consume('my-test-context-1') contextValue!: string;
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content-{{@id}}">{{this.contextValue}}</div>
      `,
      TestConsumerComponent,
    );

    interface TestContext {
      TestProviderComponent1: typeof TestProviderComponent1;
      TestProviderComponent2: typeof TestProviderComponent2;
      TestConsumerComponent: typeof TestConsumerComponent;
    }
    (this as unknown as TestContext).TestProviderComponent1 =
      TestProviderComponent1;
    (this as unknown as TestContext).TestProviderComponent2 =
      TestProviderComponent2;
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;

    await render<TestContext>(hbs`
      <this.TestProviderComponent1>
        <this.TestConsumerComponent @id="1" />
      </this.TestProviderComponent1>
      <this.TestProviderComponent2>
        <this.TestConsumerComponent @id="2" />
      </this.TestProviderComponent2>
    `);

    assert.dom('#content-1').hasText('1');
    assert.dom('#content-2').hasText('');
  });

  test('consuming context in conditional', async function (assert) {
    class TestProviderComponent extends Component<{
      Element: HTMLDivElement;
      Blocks: {
        default: [];
      };
    }> {
      @tracked count = 1;

      @provide('my-test-context')
      get myState() {
        return this.count;
      }

      increment = () => {
        this.count++;
      };
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div>
          {{! @glint-ignore }}
          <button {{on "click" this.increment}} id="increment" type="button">Increment</button>
          {{! @glint-ignore }}
          {{yield}}
        </div>
      `,
      TestProviderComponent,
    );

    class TestConsumerComponent extends Component<{
      Element: HTMLDivElement;
    }> {
      @consume('my-test-context') contextValue!: string;
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content">{{this.contextValue}}</div>
      `,
      TestConsumerComponent,
    );

    class TrackedContainer {
      @tracked hidden = false;
    }

    const trackedContainer = new TrackedContainer();

    interface TestContext {
      TestProviderComponent: typeof TestProviderComponent;
      TestConsumerComponent: typeof TestConsumerComponent;
      trackedContainer: TrackedContainer;
    }
    (this as unknown as TestContext).TestProviderComponent =
      TestProviderComponent;
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;
    (this as unknown as TestContext).trackedContainer = trackedContainer;

    await render<TestContext>(hbs`
      <this.TestProviderComponent>
        {{#unless this.trackedContainer.hidden}}
          <this.TestConsumerComponent />
        {{/unless}}
      </this.TestProviderComponent>
    `);

    assert.dom('#content').exists();
    assert.dom('#content').hasText('1');

    trackedContainer.hidden = true;
    await settled();
    assert.dom('#content').doesNotExist();

    trackedContainer.hidden = false;
    await settled();
    assert.dom('#content').exists();
    assert.dom('#content').hasText('1');

    trackedContainer.hidden = true;
    await settled();
    await click('#increment');
    trackedContainer.hidden = false;
    await settled();
    assert.dom('#content').exists();
    assert.dom('#content').hasText('2');
  });

  test('context provider in conditional', async function (assert) {
    class TestProviderComponent extends Component<{
      Element: HTMLDivElement;
      Blocks: {
        default: [];
      };
    }> {
      @provide('my-test-context')
      get myState() {
        return '1';
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div>{{yield}}</div>
      `,
      TestProviderComponent,
    );

    class TestConsumerComponent extends Component<{
      Element: HTMLDivElement;
    }> {
      @consume('my-test-context') contextValue!: string;
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content">{{this.contextValue}}</div>
      `,
      TestConsumerComponent,
    );

    class TrackedContainer {
      @tracked hidden = false;
    }

    const trackedContainer = new TrackedContainer();

    interface TestContext {
      TestProviderComponent: typeof TestProviderComponent;
      TestConsumerComponent: typeof TestConsumerComponent;
      trackedContainer: TrackedContainer;
    }
    (this as unknown as TestContext).TestProviderComponent =
      TestProviderComponent;
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;
    (this as unknown as TestContext).trackedContainer = trackedContainer;

    await render<TestContext>(hbs`
      {{#unless this.trackedContainer.hidden}}
        <this.TestProviderComponent>
          <this.TestConsumerComponent />
        </this.TestProviderComponent>
      {{/unless}}
    `);

    assert.dom('#content').exists();
    assert.dom('#content').hasText('1');

    trackedContainer.hidden = true;
    await settled();
    assert.dom('#content').doesNotExist();

    trackedContainer.hidden = false;
    await settled();
    assert.dom('#content').exists();
    assert.dom('#content').hasText('1');
  });

  test('consuming context with another provider in conditional sibling', async function (assert) {
    class TestProviderComponent extends Component<{
      Args: {
        value: string;
      };
      Element: HTMLDivElement;
      Blocks: {
        default: [];
      };
    }> {
      @provide('my-test-context')
      get myState() {
        return this.args.value;
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div>{{yield}}</div>
      `,
      TestProviderComponent,
    );

    class TestConsumerComponent extends Component<{
      Element: HTMLDivElement;
    }> {
      @consume('my-test-context') contextValue!: string;
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content">{{this.contextValue}}</div>
      `,
      TestConsumerComponent,
    );

    class TrackedContainer {
      @tracked hidden = true;
    }

    const trackedContainer = new TrackedContainer();

    interface TestContext {
      TestProviderComponent: typeof TestProviderComponent;
      TestConsumerComponent: typeof TestConsumerComponent;
      trackedContainer: TrackedContainer;
    }
    (this as unknown as TestContext).TestProviderComponent =
      TestProviderComponent;
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;
    (this as unknown as TestContext).trackedContainer = trackedContainer;

    await render<TestContext>(hbs`
      <this.TestProviderComponent @value="1">
        {{#unless this.trackedContainer.hidden}}
          <this.TestProviderComponent @value="2" />
        {{/unless}}

        <this.TestConsumerComponent/>
      </this.TestProviderComponent>
    `);

    assert.dom('#content').hasText('1');

    trackedContainer.hidden = false;
    await settled();
    assert.dom('#content').hasText('1');

    trackedContainer.hidden = true;
    await settled();
    assert.dom('#content').hasText('1');
  });

  test('nesting different contexts', async function (assert) {
    class TestProviderComponent1 extends Component<{
      Element: HTMLDivElement;
      Blocks: {
        default: [];
      };
    }> {
      @provide('my-test-context-1')
      get myState() {
        return 1;
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div>{{yield}}</div>
      `,
      TestProviderComponent1,
    );

    class TestProviderComponent2 extends Component<{
      Element: HTMLDivElement;
      Blocks: {
        default: [];
      };
    }> {
      @provide('my-test-context-2')
      get myState() {
        return 2;
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div>{{yield}}</div>
      `,
      TestProviderComponent2,
    );

    class TestConsumerComponent1 extends Component<{
      Element: HTMLDivElement;
    }> {
      @consume('my-test-context-1') contextValue!: string;
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content-1">{{this.contextValue}}</div>
      `,
      TestConsumerComponent1,
    );

    class TestConsumerComponent2 extends Component<{
      Element: HTMLDivElement;
    }> {
      @consume('my-test-context-2') contextValue!: string;
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content-2">{{this.contextValue}}</div>
      `,
      TestConsumerComponent2,
    );

    interface TestContext {
      TestProviderComponent1: typeof TestProviderComponent1;
      TestProviderComponent2: typeof TestProviderComponent2;
      TestConsumerComponent1: typeof TestConsumerComponent1;
      TestConsumerComponent2: typeof TestConsumerComponent2;
    }
    (this as unknown as TestContext).TestProviderComponent1 =
      TestProviderComponent1;
    (this as unknown as TestContext).TestProviderComponent2 =
      TestProviderComponent2;
    (this as unknown as TestContext).TestConsumerComponent1 =
      TestConsumerComponent1;
    (this as unknown as TestContext).TestConsumerComponent2 =
      TestConsumerComponent2;

    await render<TestContext>(hbs`
      <this.TestProviderComponent1>
        <this.TestProviderComponent2>
          <this.TestConsumerComponent1 />
          <this.TestConsumerComponent2 />
        </this.TestProviderComponent2>
      </this.TestProviderComponent1>
    `);

    assert.dom('#content-1').hasText('1');
    assert.dom('#content-2').hasText('2');
  });

  test('provider that references its own context and reading context value at construct time', async function (assert) {
    class TestProviderComponent extends Component<{
      Element: HTMLDivElement;
      Blocks: {
        default: [];
      };
    }> {
      @consume('my-test-context') parentContextValue!: number;

      get nextContextValue() {
        return (this.parentContextValue ?? 0) + 1;
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <ContextProvider @key="my-test-context" @value={{this.nextContextValue}}>{{yield}}</ContextProvider>
      `,
      TestProviderComponent,
    );

    class TestConsumerComponent extends Component<{
      Element: HTMLDivElement;
    }> {
      @consume('my-test-context') contextValue!: number;

      readValue = this.contextValue;
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content">{{this.readValue}}</div>
      `,
      TestConsumerComponent,
    );

    interface TestContext {
      TestProviderComponent: typeof TestProviderComponent;
      TestConsumerComponent: typeof TestConsumerComponent;
    }
    (this as unknown as TestContext).TestProviderComponent =
      TestProviderComponent;
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;

    await render<TestContext>(hbs`
      <this.TestProviderComponent>
        <this.TestConsumerComponent />
      </this.TestProviderComponent>
    `);

    assert.dom('#content').hasText('1');
  });
});
