import type ApplicationInstance from '@ember/application/instance';
import { CONTEXT_COMPONENT_INSTANCE_PROPERTY } from '../-private/symbols';
import { ContextProvider } from '../-private/create-context';

export function initialize(applicationInstance: ApplicationInstance) {
  const owner = applicationInstance;

  // Renderer is a private interface
  const renderer = owner.lookup('renderer:-dom') as any;
  // Glimmer doesn't expose the actual DebugRenderTree class/type
  const debugRenderTree = renderer?.debugRenderTree as any;

  if (debugRenderTree != null) {
    const originalCreate = debugRenderTree.create;
    debugRenderTree.create = function (state: any, _node: any) {
      originalCreate.call(debugRenderTree, state, _node);

      // nodeFor is a private method, not typed
      // the node itself would be of type InternalRenderNode, but that is also
      // not exposed
      const node = this.nodeFor(state);
      const { instance, parent } = node;

      // Store context information on the nodes.
      // Template-only components don't have backing instances, which means we
      // wouldn't be able to propagate the context through just instances.
      // If the parent node has context information - forward it to the child
      // node.
      if (parent?.[CONTEXT_COMPONENT_INSTANCE_PROPERTY] != null) {
        node[CONTEXT_COMPONENT_INSTANCE_PROPERTY] =
          parent[CONTEXT_COMPONENT_INSTANCE_PROPERTY];
      }

      if (instance == null) {
        return;
      }

      // If there is an instance, and it's a ContextProvider component, we:
      // 1. Clone the contexts object, to make sure we don't mutate parent
      //    objects later down the line.
      // 2. Attach the ContextProvider instance to that contexts object, so it
      //    can be forwarded down the tree.
      if (instance instanceof ContextProvider) {
        if (node[CONTEXT_COMPONENT_INSTANCE_PROPERTY] == null) {
          node[CONTEXT_COMPONENT_INSTANCE_PROPERTY] = {};
        } else {
          node[CONTEXT_COMPONENT_INSTANCE_PROPERTY] = {
            ...node[CONTEXT_COMPONENT_INSTANCE_PROPERTY],
          };
        }
        node[CONTEXT_COMPONENT_INSTANCE_PROPERTY][instance.id] = instance;
      }

      // Finally, copy the contexts object from the node to the instance, so
      // that we can access it in actual components.
      if (node[CONTEXT_COMPONENT_INSTANCE_PROPERTY] != null) {
        instance[CONTEXT_COMPONENT_INSTANCE_PROPERTY] =
          node[CONTEXT_COMPONENT_INSTANCE_PROPERTY];
      }
    };
  }
}

export default {
  initialize,
};
