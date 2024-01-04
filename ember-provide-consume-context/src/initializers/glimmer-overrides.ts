import { overrideGlimmerRuntime } from '../-private/override-glimmer-runtime-classes';
import * as glimmerRuntime from '@glimmer/runtime';

export function initialize() {
  overrideGlimmerRuntime(glimmerRuntime);
}

export default {
  initialize,
};
