import Variant from './components/Variant';
import Experiment from './components/Experiment';
import emitter from './events';
import { EXPERIMENT_PLAYED, EXPERIMENT_WON } from './constants';
import {
  withPermutationContext,
  withPermutedStaticProps,
  permuteStaticPaths,
  getStaticProps,
} from './next';

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
