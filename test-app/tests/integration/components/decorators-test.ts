import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { consume, provide } from 'ember-provide-consume-context';
import { tracked } from '@glimmer/tracking';

module('Integration | Decorators', function (hooks) {
  setupRenderingTest(hooks);

  test('a consumer can read context', async function (assert) {
    class TestProviderComponent extends Component<{
      Element: HTMLDivElement;
      Args: {};
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
      Args: {};
      Blocks: {};
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

  test('the built-in consumer can read context where provider uses decorator', async function (assert) {
    class TestProviderComponent extends Component<{
      Element: HTMLDivElement;
      Args: {};
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

  test('a consumer updates when provider value changes', async function (assert) {
    class TestProviderComponent extends Component<{
      Element: HTMLDivElement;
      Args: {};
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
      hbs`
        <div>
          <div>
            {{! @glint-ignore }}
            <button {{on "click" this.increment}} id="increment" type="button">Increment</button>
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
      Args: {};
      Blocks: {};
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

    await click('#increment');
    assert.dom('#content').hasText('2');
  });
});
