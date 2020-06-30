import { Variant, Experiment } from './abTestingInfra';

import emitter, {
  EXPERIMENT_PLAYED,
  EXPERIMENT_WON,
} from './abTestingInfra/emitter';

import {
  withPermutationContext,
  withPermutedStaticProps,
  permuteStaticPaths,
  getStaticProps,
} from './utils/page';

export {
  Experiment,
  Variant,
  emitter,
  EXPERIMENT_PLAYED,
  EXPERIMENT_WON,
  withPermutationContext,
  withPermutedStaticProps,
  permuteStaticPaths,
  getStaticProps,
};
