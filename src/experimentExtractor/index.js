const fs = require("fs-extra");
const {
  EXPERIMENT_COMPONENT_NAME,
  EXPERIMENTS_FILE_NAME,
} = require("./constants");
const { extractExperimentData } = require("./parser");

// TODO: move to utils and add tests
const chunkNameToPageNameRegex = (chunkName) => {
  const normalizedChunkName = chunkName
    .replace(/\\+/gi, "/") // replacing all \\ to a /
    .replace(/\.\S+$/gi, "") // remove .js extension
    .replace(/^pages/gi, "^") // replace 'pages' prefix with ^
    .replace(/\//gi, "\\/") // replace all / with \/
    .replace(/\[\S+\]/gi, "[^\\s\\/]+"); // replace [__anything__] with [^\s\/]+

  return `${normalizedChunkName}$`; // add $ at the end
};

const PLUGIN_NAME = "ExperimentExtractorPlugin";
const LIBRARY_NAME = "next-experiments";

class ExperimentExtractorPlugin {
  constructor(
    options = {
      resultFilePath: EXPERIMENTS_FILE_NAME,
      isDebug: false,
      libraryName: LIBRARY_NAME,
    }
  ) {
    this.resultFilePath = options.resultFilePath;
    this.isDebug = options.isDebug;
    this.libraryName = options.libraryName;
  }

  apply(compiler) {
    const foundModulesWithExperiments = [];

    compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, (factory) => {
      factory.hooks.parser.for("javascript/auto").tap(PLUGIN_NAME, (parser) => {
        parser.hooks.importSpecifier.tap(
          PLUGIN_NAME,
          (statement, source, exportName, identifierName) => {
            if (
              source.indexOf(this.libraryName) !== -1 &&
              exportName === EXPERIMENT_COMPONENT_NAME
            ) {
              foundModulesWithExperiments.push(parser.state.module);
            }
          }
        );
      });
    });

    compiler.hooks.emit.tap(PLUGIN_NAME, (compilation) => {
      if (foundModulesWithExperiments.length === 0) {
        compilation.errors.push(
          new Error(
            `Did not find any .jsx or .tsx component with "import { ${EXPERIMENT_COMPONENT_NAME} } from "${this.libraryName}"`
          )
        );
      }

      const experimentsByChunkName = compilation.chunks.reduce(
        (experimentsByChunkName, chunk) => {
          chunk.getModules().forEach((module) => {
            module.buildInfo &&
              module.buildInfo.fileDependencies &&
              module.buildInfo.fileDependencies.forEach((filepath) => {
                foundModulesWithExperiments.forEach((foundModule) => {
                  const componentWithExperiment = foundModule.resource;
                  if (componentWithExperiment === filepath) {
                    const chunkName = chunk.name;
                    const experimentsData = extractExperimentData(
                      componentWithExperiment
                    );

                    if (experimentsByChunkName.has(chunkName)) {
                      const prevData = experimentsByChunkName.get(chunkName);
                      experimentsByChunkName.set(chunkName, {
                        ...prevData,
                        componentsWithExperiments: [
                          ...prevData.componentsWithExperiments,
                          componentWithExperiment,
                        ],
                        experimentsPayload: {
                          ...prevData.experimentsPayload,
                          ...experimentsData,
                        },
                      });
                    } else {
                      experimentsByChunkName.set(chunkName, {
                        chunkName: chunkName,
                        componentsWithExperiments: [componentWithExperiment],
                        experimentsPayload: experimentsData,
                      });
                    }
                  }
                });
              });
          });

          return experimentsByChunkName;
        },
        new Map()
      );

      const experiments = Array.from(experimentsByChunkName.values())
        .filter((value) => !!value.experimentsPayload)
        .map((value) => {
          const pagePathRegex = chunkNameToPageNameRegex(value.chunkName);

          if (this.isDebug) {
            return {
              ...value,
              pagePathRegex,
            };
          }

          return {
            experimentsPayload: value.experimentsPayload,
            pagePathRegex,
          };
        });

      fs.writeJSONSync(this.resultFilePath, experiments);
    });
  }
}

module.exports = ExperimentExtractorPlugin;
