import Ember from 'ember';
import { overrideGlimmerRuntime } from '../-private/override-glimmer-runtime-classes';
import { getGlobalConfig, importSync } from '@embroider/macros';

export function initialize() {
  if ((Ember as any).__loader?.require == null) {
    return;
  }

  let glimmerRuntime;

  // In builds with `strictEmber = false`, Ember.__loader.require will throw.
  // In those cases, we catch the error, and try to access the runtime via the
  // importSync macro, which will be resolved at build-time.
  try {
    glimmerRuntime = (Ember as any).__loader.require('@glimmer/runtime');
  } catch {
    glimmerRuntime = importSync('@glimmer/runtime');
  }
  if (glimmerRuntime == null) {
    return;
  }

  overrideGlimmerRuntime(glimmerRuntime);
}

export default {
  initialize,
};
