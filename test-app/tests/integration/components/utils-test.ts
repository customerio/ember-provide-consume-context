import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { setComponentTemplate } from '@ember/component';
import { getContext, setContext } from 'ember-provide-consume-context';

module('Integration | Utils', function (hooks) {
  setupRenderingTest(hooks);

  test('reading a context that does not exist returns `undefined`', async function (assert) {
    class TestConsumerComponent extends Component<{
      Element: HTMLDivElement;
    }> {
      get contextValue(): string | undefined {
        return getContext(this, 'my-test-context');
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content">{{if (eq this.contextValue undefined) "undefined" this.contextValue}}</div>
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

  test('reading a context value with the functional utility works', async function (assert) {
    class TestConsumerComponent extends Component<{
      Element: HTMLDivElement;
    }> {
      get contextValue(): string | undefined {
        return getContext(this, 'my-test-context');
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content">{{if (eq this.contextValue undefined) "undefined" this.contextValue}}</div>
      `,
      TestConsumerComponent,
    );

    interface TestContext {
      TestConsumerComponent: typeof TestConsumerComponent;
    }
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;

    await render(hbs`
      <ContextProvider @key="my-test-context" @value="5">
        <this.TestConsumerComponent />
      </ContextProvider>
    `);

    assert.dom('#content').hasText('5');
  });

  test('setting context with functional utility works', async function (assert) {
    class TestProviderComponent extends Component<{
      Element: HTMLDivElement;
      Blocks: {
        default: [];
      };
    }> {
      constructor(owner: any, args: any) {
        super(owner, args);

        setContext(this, 'my-test-context', '5');
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

    assert.dom('#content').hasText('5');
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

      constructor(owner: any, args: any) {
        super(owner, args);

        setContext(this, 'my-test-context-1', () => this.count1);
        setContext(this, 'my-test-context-2', () => this.count2);
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
      get contextValue1(): string | undefined {
        return getContext(this, 'my-test-context-1')?.();
      }
      get contextValue2(): string | undefined {
        return getContext(this, 'my-test-context-2')?.();
      }
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
});
