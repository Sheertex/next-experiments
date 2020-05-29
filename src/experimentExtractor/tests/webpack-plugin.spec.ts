import assert from 'assert';
import { beforeEach, describe, it } from 'mocha';
import path from 'path'
import webpack from 'webpack';
import ExtractExperimentsPlugin from '../webpack-plugin'
import fs from 'fs-extra'

describe('experimentExtractor/webpack-plugin', function () {
  
  const resultFilePath = path.resolve(__dirname, 'tmp', 'experiments.json')

  const getWebpackConfig = (entryFilePath, entryName = 'index') => { 
    const entry = {}
    entry[entryName] = path.resolve(__dirname, "webpackFiles", ...entryFilePath) 

    return ({        
      target: 'node',
      mode: "production",
      entry: entry,
      resolve: {
        extensions: [ '.jsx', '.tsx', '.ts', '.js' ],
      },
      output: {
        libraryTarget: 'commonjs',
        filename: '[name]/index.js',
        path: path.resolve(__dirname, 'tmp'),
      },
      module: {
        rules: [
          {
            test: /\.[jt]sx?/,
            include: path.resolve(__dirname, '..', '..'),
            exclude: /node_modules/,
            use: 'babel-loader',
          }
        ]
      },
      plugins: [
        new ExtractExperimentsPlugin({ resultFilePath: resultFilePath, isDebug: false })
      ]        
    })
  };

  const runWebpack = (entryFilePath, entryName) => new Promise((resolve, reject) => {
    webpack(getWebpackConfig(entryFilePath, entryName), (err, stats) => {         
      if (err) {
        reject(err);
      } else if (stats.hasErrors()) {
        reject(stats.toString());          
      }     
      resolve()       
    });
 });

  describe('#ExperimentExtractorPlugin', function() {
    beforeEach(() => {
      fs.emptyDirSync(path.resolve(__dirname, 'tmp'))
    })

    after(() => {
      fs.emptyDirSync(path.resolve(__dirname, 'tmp'))
    })

    it('Finds one experiment in sample .jsx file', async function () {
      this.timeout(10000);

      await runWebpack(['sample.jsx']);     

      const result = fs.readJSONSync(resultFilePath)
      const expectedResult = [
        {               
          experimentsPayload: { experiment: ['variantA', 'variantB'] },
          pagePathRegex: 'index',
        },
      ];     
              
      assert.deepStrictEqual(result, expectedResult);
    });

    it('File w/o experiments but with Experiment import will not be added to experiments.json', async function () {
      this.timeout(10000);

      await runWebpack(['empty.jsx']);   
     
     const result = fs.readJSONSync(resultFilePath)
     const expectedResult = [];     
              
     assert.deepStrictEqual(result, expectedResult);
    });

    it('Correctly parse file with several components with experiments', async function () {
      this.timeout(10000);

      await runWebpack(['entryWithSeveralExperiments', 'index.jsx']);   

     const result = fs.readJSONSync(resultFilePath)
     const expectedResult = [{
        "experimentsPayload": {
          "experiment1": [
            "variantA",
            "variantB"
          ],
          "experiment2": [
            "variantA",
            "variantB"
          ]
        },
        "pagePathRegex": "index"
      }
    ]   
              
     assert.deepStrictEqual(result, expectedResult);
    });
    
    it('Fails if file did not have any experiments', async function () {
      this.timeout(10000);

      assert.rejects(
        runWebpack(['noImports.jsx']),
        /ERROR in Did not find any component with "import { Experiment } from "abTesting"/gmi)      
    });

    it('Resolves correct regex for dynamic pages', async function () {
      this.timeout(10000);

      await runWebpack(['sample.jsx'], 'pages/products/[handle]');

      const result = fs.readJSONSync(resultFilePath)
      const expectedResult = [{
          "experimentsPayload": {
            "experiment": [
              "variantA",
              "variantB"
            ]
          },
          "pagePathRegex": "^\\/products\\/[^\\s\\/]+"
        }
      ]   
              
     assert.deepStrictEqual(result, expectedResult);
    });

    it('Resolves correct regex for static pages', async function () {
      this.timeout(10000);

      await runWebpack(['sample.jsx'], 'pages/products.js');

      const result = fs.readJSONSync(resultFilePath)
      const expectedResult = [{
          "experimentsPayload": {
            "experiment": [
              "variantA",
              "variantB"
            ]
          },
          "pagePathRegex": "^\\/products$"
        }
      ]   
              
     assert.deepStrictEqual(result, expectedResult);
    });
  })
});