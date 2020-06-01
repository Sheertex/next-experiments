import EventEmitter from 'eventemitter3';
declare const emitter: EventEmitter<string | symbol, any>;
export declare const EXPERIMENT_PLAYED = "EXPERIMENT_PLAYING";
export declare const EXPERIMENT_WON = "EXPERIMENT_WON";
declare global {
    interface Window {
        experiments: Map<string, boolean>;
    }
}
export declare const recordPlay: (experimentName: string, variantName: string) => void;
export declare const recordWin: (experimentName: string, variantName: string) => void;
export default emitter;
