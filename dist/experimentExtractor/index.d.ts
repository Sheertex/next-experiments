export = ExperimentExtractorPlugin;
declare class ExperimentExtractorPlugin {
    constructor(options?: {
        resultFilePath: string;
        isDebug: boolean;
        libraryName: string;
    });
    resultFilePath: string;
    isDebug: boolean;
    libraryName: string;
    apply(compiler: any): void;
}
