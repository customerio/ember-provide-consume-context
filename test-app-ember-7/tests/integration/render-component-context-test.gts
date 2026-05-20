import { getOwner } from '@ember/owner';
import { renderComponent } from '@ember/renderer';
import { render } from '@ember/test-helpers';
import Component from '@glimmer/component';
import { consume, provide } from 'ember-provide-consume-context';
import ContextConsumer from 'ember-provide-consume-context/components/context-consumer';
import ContextProvider from 'ember-provide-consume-context/components/context-provider';
import { modifier } from 'ember-modifier';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app-ember-7/tests/helpers';

module('Integration | renderComponent context', function (hooks) {
  setupRenderingTest(hooks);

  test('a consumer can read context when renderComponent is called from a modifier', async function (assert) {
    class TestConsumerComponent extends Component {
      @consume('my-test-context') contextValue!: string;

      <template>
        <div id="render-component-content">{{this.contextValue}}</div>
      </template>
    }

    class TestHostComponent extends Component {
      renderNestedComponent = modifier((element: Element) => {
        const owner = getOwner(this);
        if (owner == null) {
          throw new Error('Could not find test owner');
        }

        const result = renderComponent(
          <template>
            <ContextProvider @key="my-test-context" @value="rendered">
              <TestConsumerComponent />
            </ContextProvider>
          </template>,
          {
            into: element,
            owner,
          },
        );

        return () => result.destroy();
      });

      <template>
        <div {{this.renderNestedComponent}}></div>
      </template>
    }

    await render(<template><TestHostComponent /></template>);

    assert.dom('#render-component-content').hasText('rendered');
  });

  test('a consumer can read renderComponent context during initialization', async function (assert) {
    class TestConsumerComponent extends Component {
      @consume('my-test-context') contextValue!: string;
      contextValueAtInit = this.contextValue;

      <template>
        <div id="render-component-init-content">
          {{this.contextValueAtInit}}
        </div>
      </template>
    }

    class TestProviderComponent extends Component {
      @provide('my-test-context') contextValue = 'rendered';

      <template><TestConsumerComponent /></template>
    }

    class TestHostComponent extends Component {
      renderNestedComponent = modifier((element: Element) => {
        const owner = getOwner(this);
        if (owner == null) {
          throw new Error('Could not find test owner');
        }

        const result = renderComponent(TestProviderComponent, {
          into: element,
          owner,
        });

        return () => result.destroy();
      });

      <template>
        <div {{this.renderNestedComponent}}></div>
      </template>
    }

    await render(<template><TestHostComponent /></template>);

    assert.dom('#render-component-init-content').hasText('rendered');
  });

  test('a built-in consumer can read renderComponent context', async function (assert) {
    class TestProviderComponent extends Component {
      @provide('my-test-context') contextValue = 'rendered';

      <template>
        <ContextConsumer @key="my-test-context" as |value|>
          <div id="render-component-consumer-content">{{value}}</div>
        </ContextConsumer>
      </template>
    }

    class TestHostComponent extends Component {
      renderNestedComponent = modifier((element: Element) => {
        const owner = getOwner(this);
        if (owner == null) {
          throw new Error('Could not find test owner');
        }

        const result = renderComponent(TestProviderComponent, {
          into: element,
          owner,
        });

        return () => result.destroy();
      });

      <template>
        <div {{this.renderNestedComponent}}></div>
      </template>
    }

    await render(<template><TestHostComponent /></template>);

    assert.dom('#render-component-consumer-content').hasText('rendered');
  });
});
