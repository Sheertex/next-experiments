import assert from 'assert';
import { describe, it } from 'mocha';

import { isValidName } from './utils';

describe('abTestingInfra/utils', function () {
  describe('#isValidName', function () {
    it('returns true for valid names', function () {
      assert.ok(isValidName('valid-name'));
      assert.ok(isValidName('valid-name-too'));
      assert.ok(isValidName('valid-123123-name-too'));
      assert.ok(isValidName('123123123213'));
      assert.ok(isValidName('test-123213'));
    });

    it('returns false for invalid names', function () {
      assert.ok(!isValidName('#invalid-name'));
      assert.ok(!isValidName('@invalid-name'));
      assert.ok(!isValidName('invalid-%name'));
      assert.ok(!isValidName('invalid-$name'));
      assert.ok(!isValidName('invalid-name^^'));
      assert.ok(!isValidName('inVAlid-name'));
    });
  });
});
