import assert from 'assert';
import { after, before, describe, it } from 'mocha';
import path from 'path'
import { extractExperimentData } from '../parser';


describe('experimentExtractor/parser', function () {

  //TODO: duplicated, should I refactor it? Or use some library for this type of things?
  const assertIsUndefined = (value): void => {
    assert.ok(typeof value === 'undefined');
  };
  describe('#extractExperimentData', function () {
    it('returns undefined if file has not .tsx extension', async function() {
      assertIsUndefined(extractExperimentData(path.join(__dirname, 'parserFiles', 'empty.js')))                  
    })

    it('throws if file is not found', async function() {
      assert.throws(() => extractExperimentData(path.join(__dirname, 'parserFiles', 'not-found.tsx')), Error)            
    })

    it('return experiments for .tsx file', async function() {      
      const EXPECTED_RESULT = { experiment: [ 'variantA', 'variantB' ] }
      const experiments = extractExperimentData(path.join(__dirname, 'parserFiles', 'sample.tsx'))
      assert.deepStrictEqual(experiments, EXPECTED_RESULT)
    })

    it('return experiments for .jsx file', async function() {      
      const EXPECTED_RESULT = { experiment: [ 'variantA', 'variantB' ] }
      const experiments = extractExperimentData(path.join(__dirname, 'parserFiles', 'sample.jsx'))
      assert.deepStrictEqual(experiments, EXPECTED_RESULT)
    })

    it('return experiments even if they are spreaded through several components', async function() {      
      const EXPECTED_RESULT = { experiment: [ 'variantA', 'variantB', 'variantC', 'variantD' ] }
      const experiments = extractExperimentData(path.join(__dirname, 'parserFiles', 'several-components.tsx'))
      // Sorting to apply deepStrictEqual
      experiments.experiment = experiments.experiment.sort()
      assert.deepStrictEqual(experiments, EXPECTED_RESULT)
    })

    it('returns several experiments from one file', async function() {      
      const EXPECTED_RESULT = { experimentA: [ 'variantA', 'variantB'], experimentB: ['variantA', 'variantB'] }
      const experiments = extractExperimentData(path.join(__dirname, 'parserFiles', 'several-experiments.tsx'))            
      assert.deepStrictEqual(experiments, EXPECTED_RESULT)
    })

    it('throws error when experiment has no name', async function() {            
      assert.throws(() => extractExperimentData(path.join(__dirname, 'parserFiles', 'experiment-without-name.tsx')), { message: 'Found experiment without name' })            
    })

    it('throws error when experiment has empty name', async function() {            
      assert.throws(() => extractExperimentData(path.join(__dirname, 'parserFiles', 'experiment-with-empty-name.tsx')), { message: 'Found experiment with empty name' })            
    })

    it('throws error when experiment has no variants as nested children', async function() {            
      assert.throws(() => extractExperimentData(path.join(__dirname, 'parserFiles', 'experiment-without-variants.tsx')), { message: 'Found experiment w/o variants' })            
    })
  })
})