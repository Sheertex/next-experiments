/**
 * @jest-environment node
 */

import path from 'path';
import { extractExperimentData } from '../parser';

describe('webpack/parser', function () {
  describe('#extractExperimentData', function () {
    describe('throws an error when', function () {
      it('file is not found', async function () {
        expect(() =>
          extractExperimentData(
            path.join(__dirname, 'parserFiles', 'not-found.tsx'),
          ),
        ).toThrow();
      });

      it('experiment has no name', async function () {
        expect(() =>
          extractExperimentData(
            path.join(__dirname, 'parserFiles', 'experiment-without-name.tsx'),
          ),
        ).toThrowError('Found experiment without name');
      });

      it('experiment has empty name', async function () {
        expect(() =>
          extractExperimentData(
            path.join(
              __dirname,
              'parserFiles',
              'experiment-with-empty-name.tsx',
            ),
          ),
        ).toThrowError('Found experiment with empty name');
      });

      it('experiment has no variants as nested children', async function () {
        expect(() =>
          extractExperimentData(
            path.join(
              __dirname,
              'parserFiles',
              'experiment-without-variants.tsx',
            ),
          ),
        ).toThrowError('Found experiment w/o variants');
      });
    });

    describe('correctly find', function () {
      it('experiment in .tsx file', async function () {
        const EXPECTED_RESULT = { experiment: ['variantA', 'variantB'] };
        const experiments = extractExperimentData(
          path.join(__dirname, 'parserFiles', 'sample.tsx'),
        );

        expect(experiments).toStrictEqual(EXPECTED_RESULT);
      });

      it('experiment in .jsx file', async function () {
        const EXPECTED_RESULT = { experiment: ['variantA', 'variantB'] };
        const experiments = extractExperimentData(
          path.join(__dirname, 'parserFiles', 'sample.jsx'),
        );

        expect(experiments).toStrictEqual(EXPECTED_RESULT);
      });

      it('several experiments even if they are spreaded through several components', async function () {
        const EXPECTED_RESULT = {
          experiment: ['variantA', 'variantB', 'variantC', 'variantD'],
        };
        const experiments = extractExperimentData(
          path.join(__dirname, 'parserFiles', 'several-components.tsx'),
        );

        // Sorting to apply deepStrictEqual
        // FIXME: create better types around the experiments object instead
        // of using the generic object literal type
        // eslint-disable-next-line
        // @ts-ignore
        experiments.experiment = experiments.experiment.sort();
        expect(experiments).toStrictEqual(EXPECTED_RESULT);
      });

      it('several experiments in one .tsx file', async function () {
        const EXPECTED_RESULT = {
          experimentA: ['variantA', 'variantB'],
          experimentB: ['variantA', 'variantB'],
        };
        const experiments = extractExperimentData(
          path.join(__dirname, 'parserFiles', 'several-experiments.tsx'),
        );

        expect(experiments).toStrictEqual(EXPECTED_RESULT);
      });
    });

    describe('returns undefined', function () {
      it('when file has not .tsx extension', async function () {
        expect(
          extractExperimentData(
            path.join(__dirname, 'parserFiles', 'empty.js'),
          ),
        ).toBeUndefined();
      });
    });
  });
});
