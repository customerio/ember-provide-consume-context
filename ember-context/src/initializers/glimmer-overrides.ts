import Ember from 'ember';
import { overrideGlimmerRuntime } from '../-private/override-glimmer-runtime-classes';

export function initialize() {
  if ((Ember as any).__loader?.require == null) {
    return;
  }

  const glimmerRuntime = (Ember as any).__loader.require('@glimmer/runtime');
  if (glimmerRuntime == null) {
    return;
  }

  overrideGlimmerRuntime(glimmerRuntime);
}

export default {
  initialize,
};
