import EventEmitter from 'eventemitter3';
import assert from 'assert';

const emitter = new EventEmitter();

export const EXPERIMENT_PLAYED = 'EXPERIMENT_PLAYING';
export const EXPERIMENT_WON = 'EXPERIMENT_WON';

declare global {
  interface Window {
    experiments: Map<string, boolean>;
  }
}

if (typeof window !== 'undefined') {
  window.experiments = new Map<string, boolean>();
}

export const recordPlay = (
  experimentName: string,
  variantName: string,
): void => {
  if (typeof window === 'undefined') {
    return;
  }

  assert.ok(experimentName, 'Experiment name is undefined');
  assert.ok(variantName, 'Variant name is undefined');

  const experiments = window.experiments;

  if (!experiments.has(experimentName)) {
    experiments.set(experimentName, false);
    emitter.emit(EXPERIMENT_PLAYED, { experimentName, variantName });
  }
};

export const recordWin = (
  experimentName: string,
  variantName: string,
): void => {
  if (typeof window === 'undefined') {
    return;
  }

  assert.ok(experimentName, 'Experiment name is undefined');
  assert.ok(variantName, 'Variant name is undefined');

  const experiments = window.experiments;

  if (!experiments.has(experimentName)) {
    throw new Error(
      `Can't call win on experiment that is not playing. Check that Experiment component is mounted and triggerPlay function hook is working correctly. Experiment name: ${experimentName}`,
    );
  }

  if (experiments.get(experimentName) === false) {
    experiments.set(experimentName, true);
    emitter.emit(EXPERIMENT_WON, { experimentName, variantName });
  }
};

export default emitter;
