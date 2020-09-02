/**
 * @jest-environment node
 */

import mockFS from 'mock-fs';

import {
  stripPermutationsPayloadFromQuery,
  explodePathsWithVariantCombinations,
} from './permutations';
import { ParsedUrlQuery } from 'querystring';

describe('experiments/permutations', function () {
  describe('#stripPermutationsPayloadFromQuery', function () {
    describe('when query is empty', function () {
      it('it pass throught', function () {
        const result = stripPermutationsPayloadFromQuery({});

        expect(result.query).toStrictEqual({});
        expect(result.permutationsPayload).toBe('');
      });
    });

    describe('when query is undefined', function () {
      it('it pass throught', function () {
        const result = stripPermutationsPayloadFromQuery(undefined);

        expect(result.query).toBe(undefined);
        expect(result.permutationsPayload).toBe('');
      });
    });

    describe('when query has non string fields', function () {
      it('they are not changed', function () {
        const query = { a: 1, b: true };
        const result = stripPermutationsPayloadFromQuery(
          (query as unknown) as ParsedUrlQuery,
        );

        expect(result.query).toStrictEqual(query);
        expect(result.permutationsPayload).toBe('');
      });
    });

    describe('when query fields has no ab testing payload', function () {
      it('it pass throught', function () {
        const query = { a: 'a' };
        const result = stripPermutationsPayloadFromQuery(
          (query as unknown) as ParsedUrlQuery,
        );

        expect(result.query).toStrictEqual(query);
        expect(result.permutationsPayload).toBe('');
      });
    });

    describe('when query has ab testing payload', function () {
      it('it correclty extracts ab testing payload', function () {
        const query = { a: 'a--ab--test' };
        const result = stripPermutationsPayloadFromQuery(query);

        expect(result.query).toStrictEqual({ a: 'a' });
        expect(result.permutationsPayload).toBe('test');
      });
    });
  });

  describe('#explodePathsWithVariantCombinations ', function () {
    describe('when experiments json file does not exist', function () {
      const spy = jest.spyOn(console, 'warn').mockImplementation();

      beforeEach(() => {
        mockFS();
      });

      afterEach(() => {
        mockFS.restore();
        spy.mockRestore();
      });

      it('it pass throught received `paths`', function () {
        const result = explodePathsWithVariantCombinations(['/index']);

        expect(result).toStrictEqual(['/index']);
        expect(spy).toHaveBeenCalledWith(
          expect.stringMatching(
            /Failed to load experiments payload, file not found./,
          ),
        );
      });
    });

    describe('when experiments json file exists', function () {
      afterEach(() => {
        mockFS.restore();
      });

      describe('when experiments file has no experiemnts', function () {
        beforeEach(function () {
          mockFS({
            'experiments.json': JSON.stringify([]),
          });
        });

        it('it returns `paths` as is', function () {
          const result = explodePathsWithVariantCombinations(['/index']);

          expect(result).toStrictEqual(['/index']);
        });
      });

      describe('when page path match index page regex', function () {
        beforeEach(function () {
          mockFS({
            'experiments.json': JSON.stringify([
              {
                pagePathRegex: '^\\/index$',
                experimentsPayload: { experiment: ['variant'] },
              },
            ]),
          });
        });

        it('it returns correct permutations for the index page', function () {
          expect(explodePathsWithVariantCombinations(['/'])).toStrictEqual([
            '/',
            '/index--ab--experiment=variant',
          ]);
        });
      });

      describe('when page path match regex', function () {
        describe('and has single experiment with single variant', function () {
          beforeEach(function () {
            mockFS({
              'experiments.json': JSON.stringify([
                {
                  pagePathRegex: '.*',
                  experimentsPayload: { experiment: ['variant'] },
                },
              ]),
            });
          });

          it('it adds single permutation to the `paths`', function () {
            expect(
              explodePathsWithVariantCombinations(['/index']),
            ).toStrictEqual(['/index', '/index--ab--experiment=variant']);
          });
        });

        describe('and has single experiment and two variants', function () {
          beforeEach(function () {
            mockFS({
              'experiments.json': JSON.stringify([
                {
                  pagePathRegex: '.*',
                  experimentsPayload: { experiment: ['variantA', 'variantB'] },
                },
              ]),
            });
          });

          it('it adds two permutations to the `paths`', function () {
            expect(
              explodePathsWithVariantCombinations(['/index']),
            ).toStrictEqual([
              '/index',
              '/index--ab--experiment=variantA',
              '/index--ab--experiment=variantB',
            ]);
          });
        });

        describe('and has two experiments with one variant', function () {
          beforeEach(function () {
            mockFS({
              'experiments.json': JSON.stringify([
                {
                  pagePathRegex: '.*',
                  experimentsPayload: {
                    experimentA: ['variant'],
                    experimentB: ['variant'],
                  },
                },
              ]),
            });
          });

          it('it adds two permutations to the `paths`', function () {
            expect(
              explodePathsWithVariantCombinations(['/index']),
            ).toStrictEqual([
              '/index',
              '/index--ab--experimentA=variant&experimentB=variant',
            ]);
          });
        });

        describe('and has two experiments with two variants', function () {
          beforeEach(function () {
            mockFS({
              'experiments.json': JSON.stringify([
                {
                  pagePathRegex: '.*',
                  experimentsPayload: { z: ['1', '2'], a: ['1', '2'] },
                },
              ]),
            });
          });

          it('it adds four permutations to the `paths` and payload are sorted alphabetically', function () {
            expect(
              explodePathsWithVariantCombinations(['/index']),
            ).toStrictEqual([
              '/index',
              '/index--ab--a=1&z=1',
              '/index--ab--a=2&z=1',
              '/index--ab--a=1&z=2',
              '/index--ab--a=2&z=2',
            ]);
          });
        });
      });

      describe('when page path does not match regex', function () {
        beforeEach(function () {
          mockFS({
            'experiments.json': JSON.stringify([
              {
                pagePathRegex: 'something',
                experimentsPayload: { experiment: ['variant'] },
              },
            ]),
          });
        });

        it('return `paths` as is', function () {
          expect(
            explodePathsWithVariantCombinations(['/index']),
          ).toStrictEqual(['/index']);
        });
      });
    });
  });
});
