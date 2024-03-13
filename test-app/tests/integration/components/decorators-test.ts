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
});
