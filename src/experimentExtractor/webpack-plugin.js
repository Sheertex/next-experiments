const fs = require('fs-extra')
const { EXPERIMENT_COMPONENT_NAME, EXPERIMENTS_FILE_NAME } = require('./constants')
const { extractExperimentData } = require('./parser')

// TODO: move to utils and add tests
const chunkNameToPageNameRegex = (chunkName) => {
  // replacing all \\ to a /
  let normalizedChunkName = chunkName.replace(/\\+/gi, '/')        
  // replace .js extensions with $
  normalizedChunkName = normalizedChunkName.replace(/\.\S+$/gi, '$')
  // replace 'pages' prefix with ^
  normalizedChunkName = normalizedChunkName.replace(/^pages/gi, '^')
  // replace all / with \/
  normalizedChunkName = normalizedChunkName.replace(/\//gi, '\\/')
  // replace [__anything__] with [^\s\/]+
  normalizedChunkName = normalizedChunkName.replace(/\[\S+\]/gi, '[^\\s\\/]+')

  return normalizedChunkName
}

const PLUGIN_NAME = 'ExperimentExtractorPlugin'
const LIBRARY_NAME = 'abTesting'

class ExperimentExtractorPlugin {
  constructor(options = { resultFilePath: EXPERIMENTS_FILE_NAME, isDebug: false }) {
    this.resultFilePath = options.resultFilePath
    this.isDebug = options.isDebug
  }

  apply(compiler) {      
    
    const foundModulesWithExperiments = []    
              
    compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, (factory) => {   
        factory.hooks.parser.for('javascript/auto').tap(PLUGIN_NAME, parser => {
          parser.hooks.importSpecifier.tap(PLUGIN_NAME, (statement, source, exportName, identifierName) => {

            if (source.indexOf(LIBRARY_NAME) !== -1 && exportName === EXPERIMENT_COMPONENT_NAME) {                
              foundModulesWithExperiments.push(parser.state.module)                
            }                           
          });
        });
    });
    
    compiler.hooks.emit.tap(PLUGIN_NAME, (compilation) => {           

      if (foundModulesWithExperiments.length === 0) {   
        compilation.errors.push(new Error(`Did not find any component with "import { ${EXPERIMENT_COMPONENT_NAME} } from "${LIBRARY_NAME}"`))            
      }   

      const experimentsByChunkName = new Map()
      
      compilation.chunks.forEach(chunk => {
        chunk.getModules().forEach(module => {            
          module.buildInfo && module.buildInfo.fileDependencies && module.buildInfo.fileDependencies.forEach(filepath => {
            foundModulesWithExperiments.forEach(foundModule => {
              const componentWithExperiment = foundModule.resource
              if (componentWithExperiment === filepath) {
                const experimentsData = extractExperimentData(componentWithExperiment)                  
                const chunkName = chunk.name

                if (experimentsByChunkName.has(chunkName)) {

                  const prevData = experimentsByChunkName.get(chunkName)
                  experimentsByChunkName.set(chunkName, { 
                    ...prevData, 
                    componentsWithExperiments: [...prevData.componentsWithExperiments, componentWithExperiment],   
                    experimentsPayload: { ...prevData.experimentsPayload, ...experimentsData }
                  })

                } else {

                  experimentsByChunkName.set(chunkName, {
                    chunkName: chunkName,
                    componentsWithExperiments: [componentWithExperiment],
                    experimentsPayload: experimentsData
                  })
                }                                   
              }
            })              
          });
        });
      })

      const experiments = Array.from(experimentsByChunkName.values())
        .filter(value => !!value.experimentsPayload).map((value) => {
          if (this.isDebug) {
          
            return {
              ...value,            
              pagePathRegex: chunkNameToPageNameRegex(value.chunkName),          
            }

          }

          return {
            experimentsPayload: value.experimentsPayload,
            pagePathRegex: chunkNameToPageNameRegex(value.chunkName),          
          }

      });    

      fs.writeJSONSync(this.resultFilePath, experiments);        
    });    
  }
}

module.exports = ExperimentExtractorPlugin;