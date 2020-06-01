"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordWin = exports.recordPlay = exports.EXPERIMENT_WON = exports.EXPERIMENT_PLAYED = void 0;
const tslib_1 = require("tslib");
const eventemitter3_1 = tslib_1.__importDefault(require("eventemitter3"));
const emitter = new eventemitter3_1.default();
exports.EXPERIMENT_PLAYED = 'EXPERIMENT_PLAYING';
exports.EXPERIMENT_WON = 'EXPERIMENT_WON';
if (typeof window !== 'undefined') {
    window.experiments = new Map();
}
exports.recordPlay = (experimentName, variantName) => {
    if (typeof window === 'undefined') {
        return;
    }
    if (!experimentName) {
        throw new Error('Experiment name is undefined');
    }
    if (!variantName) {
        throw new Error('Variant name is undefined');
    }
    const experiments = window.experiments;
    if (!experiments.has(experimentName)) {
        experiments.set(experimentName, false);
        emitter.emit(exports.EXPERIMENT_PLAYED, { experimentName, variantName });
    }
};
exports.recordWin = (experimentName, variantName) => {
    if (typeof window === 'undefined') {
        return;
    }
    if (!experimentName) {
        throw new Error('Experiment name is undefined');
    }
    if (!variantName) {
        throw new Error('Variant name is undefined');
    }
    const experiments = window.experiments;
    if (!experiments.has(experimentName)) {
        throw new Error(`Can't call win on experiment that is not playing. Check that Experiment component is mounted and triggerPlay function hook is working correctly. Experiment name: ${experimentName}`);
    }
    if (experiments.get(experimentName) === false) {
        experiments.set(experimentName, true);
        emitter.emit(exports.EXPERIMENT_WON, { experimentName, variantName });
    }
};
exports.default = emitter;
//# sourceMappingURL=emitter.js.map