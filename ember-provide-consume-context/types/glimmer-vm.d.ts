import { ProvideConsumeContextContainer } from '../src/-private/provide-consume-context-container';

declare module '@glimmer/runtime' {
  interface EnvironmentImpl {
    provideConsumeContextContainer?: ProvideConsumeContextContainer;
  }
}

declare module '@glimmer/interfaces' {
  interface Environment {
    provideConsumeContextContainer?: ProvideConsumeContextContainer;
  }
}
