import assert from 'assert';
import { describe, it, beforeEach, afterEach } from 'mocha';
import mockFS from 'mock-fs';

import {
  isValidName,
  stripPermutationsPayload,
  getPermutatedPaths,
} from '../utils';

describe('abTestingInfra/utils', function () {
  describe('#isValidName', function () {
    it('returns true for valid names', async function () {
      assert.ok(isValidName('valid-name'));
      assert.ok(isValidName('valid-name-too'));
      assert.ok(isValidName('valid-123123-name-too'));
      assert.ok(isValidName('123123123213'));
      assert.ok(isValidName('test-123213'));
    });

    it('returns false for invalid names', async function () {
      assert.ok(!isValidName('#invalid-name'));
      assert.ok(!isValidName('@invalid-name'));
      assert.ok(!isValidName('invalid-%name'));
      assert.ok(!isValidName('invalid-$name'));
      assert.ok(!isValidName('invalid-name^^'));
      assert.ok(!isValidName('inVAlid-name'));
    });
  });

  describe('#stripPermutationsPayload', function () {
    it('pass through empty query', function () {
      const result = stripPermutationsPayload({});

      assert.deepEqual(result.result, {});
      assert.equal(result.permutationsPayload, '');
    });

    it('pass through undefined query', function () {
      const result = stripPermutationsPayload({});

      assert.deepEqual(result.result, {});
      assert.equal(result.permutationsPayload, '');
    });

    it('did not change non string query fields', function () {
      const query = { a: 1, b: true };
      const result = stripPermutationsPayload(query);

      assert.deepEqual(result.result, query);
      assert.equal(result.permutationsPayload, '');
    });

    it('did not change string query fields w/o ab testing payload', function () {
      const query = { a: 'a' };
      const result = stripPermutationsPayload(query);

      assert.deepEqual(result.result, query);
      assert.equal(result.permutationsPayload, '');
    });

    it('extracts ab testing payload from query fields', function () {
      const query = { a: 'a--ab--test' };
      const result = stripPermutationsPayload(query);

      assert.deepEqual(result.result, { a: 'a' });
      assert.equal(result.permutationsPayload, 'test');
    });
  });

  describe('#getPermutatedPaths', function () {
    describe('when experiments json file does not exist', function () {
      beforeEach(() => {
        mockFS();
      });

      it('did not change paths if experiments file is not found', function () {
        const payload = ['index'];
        const result = getPermutatedPaths(payload);

        assert.deepEqual(result, payload);
      });

      afterEach(() => {
        mockFS.restore();
      });
    });

    describe('when experiments json file exists', function () {
      afterEach(() => {
        mockFS.restore();
      });

      it('did not change paths if experiments file has no experiemnts', function () {
        mockFS({
          'experiments.json': JSON.stringify([]),
        });

        const payload = ['index'];
        const result = getPermutatedPaths(payload);

        assert.deepEqual(result, payload);
      });

      it('returns permutations if page path is match experiment regex', function () {
        mockFS({
          'experiments.json': JSON.stringify([
            {
              pagePathRegex: '.*',
              experimentsPayload: { experiment: ['variant'] },
            },
          ]),
        });

        assert.deepEqual(getPermutatedPaths(['index']), [
          'index',
          'index--ab--experiment=variant',
        ]);
      });

      it('did not add permutations if page path is not match experiment regex', function () {
        mockFS({
          'experiments.json': JSON.stringify([
            {
              pagePathRegex: 'something',
              experimentsPayload: { experiment: ['variant'] },
            },
          ]),
        });

        assert.deepEqual(getPermutatedPaths(['index']), ['index']);
      });

      it('returns correct permutations if experiment has several variants', function () {
        mockFS({
          'experiments.json': JSON.stringify([
            {
              pagePathRegex: '.*',
              experimentsPayload: { experiment: ['variantA', 'variantB'] },
            },
          ]),
        });

        assert.deepEqual(getPermutatedPaths(['index']), [
          'index',
          'index--ab--experiment=variantA',
          'index--ab--experiment=variantB',
        ]);
      });

      it('returns correct permutations if page has several experiments', function () {
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

        assert.deepEqual(getPermutatedPaths(['index']), [
          'index',
          'index--ab--experimentA=variant&experimentB=variant',
        ]);
      });

      it('returns correct permutations if page has several experiments and several variants', function () {
        mockFS({
          'experiments.json': JSON.stringify([
            {
              pagePathRegex: '.*',
              experimentsPayload: {
                experimentA: ['variantA', 'variantB'],
                experimentB: ['variantA', 'variantB'],
              },
            },
          ]),
        });

        assert.deepEqual(getPermutatedPaths(['index']), [
          'index',
          'index--ab--experimentA=variantA&experimentB=variantA',
          'index--ab--experimentA=variantA&experimentB=variantB',
          'index--ab--experimentA=variantB&experimentB=variantA',
          'index--ab--experimentA=variantB&experimentB=variantB',
        ]);
      });

      it('throws error when page has more than 5 experiments', function () {
        mockFS({
          'experiments.json': JSON.stringify([
            {
              pagePathRegex: '.*',
              experimentsPayload: {
                experimentA: ['variant'],
                experimentB: ['variant'],
                experimentC: ['variant'],
                experimentD: ['variant'],
                experimentE: ['variant'],
                experimentF: ['variant'],
              },
            },
          ]),
        });

        assert.throws(
          () => getPermutatedPaths(['index']),
          /^Error: Too much experiments.*/gi,
        );
      });
    });
  });
});
