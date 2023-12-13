import Ember from 'ember';
import { overrideGlimmerRuntime } from '../-private/override-glimmer-runtime-classes';
import { getOwnConfig, importSync, macroCondition } from '@embroider/macros';

export function initialize() {
  if ((Ember as any).__loader?.require == null) {
    return;
  }

  let glimmerRuntime;
  console.log('own config', getOwnConfig());
  if (macroCondition((getOwnConfig() as any)?.staticEmberSource)) {
    glimmerRuntime = importSync('@glimmer/runtime.js');
  } else {
    glimmerRuntime = (Ember as any).__loader.require('@glimmer/runtime');
  }
  if (glimmerRuntime == null) {
    return;
  }

  overrideGlimmerRuntime(glimmerRuntime);
}

export default {
  initialize,
};
